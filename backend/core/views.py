from django.shortcuts import render
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from django.contrib.auth.models import User
from django.http import JsonResponse
from .services.amadeus_services import search_flights, search_airports, search_hotels, search_cities, search_attractions
from .serializers import (BlogPostCreateSerializer, CommentCreateSerializer, 
                       BlogPostListSerializer, UserTravelPreferencesSerializer)
from .models import BlogPost, Comment, UserTravelPreferences
from rest_framework.permissions import AllowAny
from .services.self_services import get_blogs, get_comments_helper
from .services.openai_services import generate_travel_suggestions
from .services.pexels_services import search_photos

@api_view(['POST'])
def register_user(request):
    data = request.data
    username = data.get('username')
    password = data.get('password')
    email = data.get('email')
    if User.objects.filter(username=username).exists():
        return Response({'error':'User already exists'}, status=status.HTTP_400_BAD_REQUEST)
    user = User.objects.create_user(username=username, password=password, email=email)
    return Response({'message':'User created'}, status=status.HTTP_201_CREATED)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout_user(request):
    request.user.auth_token.delete()
    return Response({'message':'User logged out'}, status=status.HTTP_200_OK)


@api_view(['PATCH'])
def update_user(request):
    user = request.user
    data = request.data
    user.username = data.get('username', user.username)
    user.email = data.get('email', user.email)
    user.save()
    return Response({'message':'User updated'}, status=status.HTTP_200_OK)

@api_view(['PUT'])
def update_user_password(request):
    user = request.user
    data = request.data
    current_password = data.get('current_password')
    new_password = data.get('new_password')
    
    if not current_password or not new_password:
        return Response(
            {'error': 'Both current password and new password are required'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    if not user.check_password(current_password):
        return Response(
            {'error': 'Current password is incorrect'}, 
            status=status.HTTP_401_UNAUTHORIZED
        )
    
    user.set_password(new_password)
    user.save()
    
    return Response({'message':'User password updated successfully'}, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def current_user(request):
    user = request.user
    password_hash = '********'
    
    return Response({
        'id': user.id,
        'username': user.username,
        'email': user.email,
        'password_hash': password_hash
    }, status=status.HTTP_200_OK)



def flight_search_view(request):
    origin = request.GET.get('origin', 'MAD')
    destination = request.GET.get('destination', 'ATH')
    departure_date = request.GET.get('departureDate', '2025-03-03')
    return_date = request.GET.get('returnDate', None)
    adults = request.GET.get('adults', 1)

    flight_data = search_flights(origin, destination, departure_date, return_date, adults)

    if isinstance(flight_data, dict) and 'error' in flight_data:
        return JsonResponse({
            "error": "Invalid travel data. Please try again with different search parameters.",
            "details": flight_data['error']
        }, status=400)

    return JsonResponse(flight_data, safe=False)


def airport_autocomplete_view(request):
    query = request.GET.get("query", "")
    if not query:
        return JsonResponse({"error": "No query provided"}, status=400)

    results = search_airports(query)
    return JsonResponse(results, safe=False)


def hotel_search_view(request):
    city_code = request.GET.get('cityCode')

    if not city_code:
        return JsonResponse({"error": "Missing required parameter: cityCode"}, status=400)

    check_in = request.GET.get('checkInDate', '2025-11-03')
    check_out = request.GET.get('checkOutDate', '2025-11-10')
    adults = request.GET.get('adults', 1)

    hotel_data = search_hotels(city_code, check_in, check_out, adults)

    if isinstance(hotel_data, dict) and 'error' in hotel_data:
        return JsonResponse({
            "error": "Invalid hotel search data. Please try again with different search parameters.",
            "details": hotel_data['error']
        }, status=400)

    return JsonResponse(hotel_data, safe=False)


def city_autocomplete_view(request):
    query = request.GET.get('query')
    if not query:
        return JsonResponse({"error": "No query provided"}, status=400)

    results = search_cities(query)
    return JsonResponse(results, safe=False)

def attractions_search_view(request):
    latitude = request.GET.get('latitude')
    longitude = request.GET.get('longitude')

    if not latitude or not longitude:
        return JsonResponse({"error": "Missing required parameters: latitude and longitude"}, status=400)
    
    attractions_data = search_attractions(latitude, longitude)

    if isinstance(attractions_data, dict) and 'error' in attractions_data:
        return JsonResponse({
            "error": "Invalid attractions search data. Please try again with different coordinates.",
            "details": attractions_data['error']
        }, status=400)

    return JsonResponse(attractions_data, safe=False)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def post_blog_view(request):
    serializer = BlogPostCreateSerializer(data=request.data, context={'request': request})
    if not serializer.is_valid():
        return Response(
            {"errors": serializer.errors},
            status=status.HTTP_400_BAD_REQUEST
        )

    try:
        blog_post = serializer.save()
    except Exception as e:
        return Response(
            {"error": "Could not create blog post. Please try again later."},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
    response_data = {
        "id": blog_post.id,
        "slug": blog_post.slug,
        "title": blog_post.title,
        "content": blog_post.content,
        "location": blog_post.location,
        "reads": blog_post.reads,
        "likes": blog_post.liked_by.count(),
        "created_at": blog_post.created_at,
        "updated_at": blog_post.updated_at,
        "author_id": request.user.id,
        "author_username": request.user.username,
    }
    return Response(response_data, status=status.HTTP_201_CREATED)


@api_view(['GET', 'PUT', 'PATCH', 'DELETE'])
@permission_classes([IsAuthenticated])
def blog_details_view(request, blog_id):
    try:
        blog = BlogPost.objects.get(id=blog_id)
    except BlogPost.DoesNotExist:
        return Response({"error": "Blog post not found."}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        serializer = BlogPostCreateSerializer(blog)
        comments_qs = Comment.objects.filter(blog_post=blog)
        comments = CommentCreateSerializer(comments_qs, many=True, context={'request': request})
        user = request.user
        if user.is_authenticated:
            is_liked = blog.liked_by.filter(pk=user.pk).exists()
        else:
            is_liked = False

        likes_count = blog.liked_by.count()
        return Response({
            "blog": serializer.data,
            "comments": comments.data,
            "is_liked": is_liked,
            "likes_count": likes_count
        }, status=status.HTTP_200_OK)

    elif request.method in ['PUT', 'PATCH']:
      
        if blog.user != request.user:
            return Response(
                {"error": "You don't have permission to edit this blog post."},
                status=status.HTTP_403_FORBIDDEN
            )
            
        
        serializer = BlogPostCreateSerializer(blog, data=request.data, partial=(request.method == 'PATCH'))
        
        if serializer.is_valid():
            updated_blog = serializer.save()
            
            
            return Response({
                "message": "Blog post updated successfully.",
                "blog": serializer.data,
                "likes_count": updated_blog.liked_by.count(),
            }, status=status.HTTP_200_OK)
            
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == 'DELETE':
        blog.delete()
        return Response({"message": "Blog post deleted."}, status=status.HTTP_204_NO_CONTENT)


@api_view(['POST', 'GET'])
@permission_classes([IsAuthenticated])
def post_or_get_comment(request, blog_id):
    try:
        blog = BlogPost.objects.get(id=blog_id)
    except BlogPost.DoesNotExist:
        return Response({"error": "Blog post not found."}, status=status.HTTP_404_NOT_FOUND)
    if request.method == 'POST':
        serializer = CommentCreateSerializer(data=request.data, context={'request': request, 'blog_post': blog})
        if not serializer.is_valid():
            return Response({"errors": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

        comment = serializer.save()

        return Response({
            "id": comment.id,
            "content": comment.content,
            "created_at": comment.created_at,
            "updated_at": comment.updated_at,
            "author_id": request.user.id,
            "author_username": request.user.username,
        }, status=status.HTTP_201_CREATED)
    elif request.method == 'GET':
        page = request.query_params.get('page', 1)
        per_page = request.query_params.get('per_page', 15)
        data = get_comments_helper(blog_id, page=page, per_page=per_page)
        if data is None:
            return Response(
                {"error": "Could not retrieve comments."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        serializer = CommentCreateSerializer(data["results"], many=True, context={'request': request})
        response_payload = {
            "results": serializer.data,
            "page": data["page"],
            "per_page": data["per_page"],
            "total_count": data["total_count"],
            "total_pages": data["total_pages"],
        }
        return Response(response_payload, status=status.HTTP_200_OK)
    else:
        return Response({"error": "Method not allowed."}, status=status.HTTP_405_METHOD_NOT_ALLOWED)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def increment_reads(request, blog_id):
    try:
        blog = BlogPost.objects.get(id=blog_id)
        blog.reads += 1
        blog.save()
        return Response({"message": "Reads incremented successfully."}, status=status.HTTP_200_OK)
    except BlogPost.DoesNotExist:
        return Response({"error": "Blog post not found."}, status=status.HTTP_404_NOT_FOUND)

@api_view(['POST', 'DELETE'])
@permission_classes([IsAuthenticated])
def like_post(request, blog_id):
    try:
        blog = BlogPost.objects.get(id=blog_id)
    except BlogPost.DoesNotExist:
        return Response({"error": "Blog post not found."}, status=status.HTTP_404_NOT_FOUND)

    user = request.user

    if request.method == 'POST':
        if blog.liked_by.filter(pk=user.pk).exists():
            return Response(
                {
                    "message": "You have already liked this post.",
                    "likes_count": blog.liked_by.count()
                },
                status=status.HTTP_200_OK
            )
        blog.liked_by.add(user)
        return Response(
            {
                "message": "Post liked successfully.",
                "likes_count": blog.liked_by.count()
            },
            status=status.HTTP_200_OK
        )

    if not blog.liked_by.filter(pk=user.pk).exists():
        return Response(
            {
                "message": "You have not liked this post yet.",
                "likes_count": blog.liked_by.count()
            },
            status=status.HTTP_200_OK
        )
    blog.liked_by.remove(user)
    return Response(
        {
            "message": "Post unliked successfully.",
            "likes_count": blog.liked_by.count()
        },
        status=status.HTTP_200_OK
    )

@api_view(['GET'])
@permission_classes([AllowAny])
def list_blogs(request):
    page = request.query_params.get('page', 1)
    per_page = request.query_params.get('per_page', 15)
    username = request.query_params.get('username', None)
    
    data = get_blogs(page=page, per_page=per_page, username=username)
    if data is None:
        return Response(
            {"error": "Could not retrieve blog list."},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


    serializer = BlogPostListSerializer(data["results"], many=True, context={'request': request})


    response_payload = {
        "results":      serializer.data,
        "page":         data["page"],
        "per_page":     data["per_page"],
        "total_count":  data["total_count"],
        "total_pages":  data["total_pages"],
    }
    return Response(response_payload, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_favourites(request):
    user = request.user
    favourite_blogs = BlogPost.objects.filter(liked_by=user)
    serializer = BlogPostListSerializer(favourite_blogs, many=True, context={'request': request})
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(['GET', 'DELETE'])
@permission_classes([IsAuthenticated])
def comment_detail(request, blog_id, comment_id):
    try:
        blog = BlogPost.objects.get(id=blog_id)
    except BlogPost.DoesNotExist:
        return Response({"error": "Blog post not found."}, status=status.HTTP_404_NOT_FOUND)
        
    try:
        comment = Comment.objects.get(id=comment_id, blog_post=blog)
    except Comment.DoesNotExist:
        return Response({"error": "Comment not found."}, status=status.HTTP_404_NOT_FOUND)
    
    if request.method == 'GET':
        serializer = CommentCreateSerializer(comment, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)
        
    elif request.method == 'DELETE':
        if comment.user != request.user:
            return Response(
                {"error": "You don't have permission to delete this comment."},
                status=status.HTTP_403_FORBIDDEN
            )
        comment.delete()
        return Response({"message": "Comment deleted successfully."}, status=status.HTTP_204_NO_CONTENT)


@api_view(['GET', 'PUT', 'PATCH'])
@permission_classes([IsAuthenticated])
def user_travel_preferences(request):
    try:
        preferences, created = UserTravelPreferences.objects.get_or_create(user=request.user)
        
        if request.method == 'GET':
            serializer = UserTravelPreferencesSerializer(preferences)
            return Response(serializer.data, status=status.HTTP_200_OK)
        
        elif request.method in ['PUT', 'PATCH']:
            partial = request.method == 'PATCH'
            serializer = UserTravelPreferencesSerializer(preferences, data=request.data, partial=partial)
            
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data, status=status.HTTP_200_OK)
            
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def suggestions(request):
    try:
        preferences, created = UserTravelPreferences.objects.get_or_create(user=request.user)
        
        suggestions_data = generate_travel_suggestions(preferences)
        
        return Response(suggestions_data, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def pexels_photos_view(request):
    query = request.GET.get('query')
    per_page = request.GET.get('per_page', 15)
    
    if not query:
        return Response({"error": "Query parameter is required"}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        photos_response = search_photos(query=query, per_page=int(per_page))
        return Response(photos_response, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({"error": str(e), "photos": []}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
