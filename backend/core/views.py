from django.shortcuts import render
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from django.contrib.auth.models import User
from django.http import JsonResponse
from .services.amadeus_services import search_flights, search_airports, search_hotels, search_cities, search_attractions
from .serializers import BlogPostCreateSerializer

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


def flight_search_view(request):
    origin = request.GET.get('origin', 'MAD')
    destination = request.GET.get('destination', 'ATH')
    departure_date = request.GET.get('departureDate', '2025-03-03')
    return_date = request.GET.get('returnDate', None)  # Can be None if one-way
    adults = request.GET.get('adults', 1)

    flight_data = search_flights(origin, destination, departure_date, return_date, adults)

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
        "likes": blog_post.likes,
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
        return Response(serializer.data)

    elif request.method in ['PUT', 'PATCH']:
        serializer = BlogPostCreateSerializer(blog, data=request.data, partial=(request.method == 'PATCH'))
        if serializer.is_valid():
            serializer.save()
            
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == 'DELETE':
        blog.delete()
        return Response({"message": "Blog post deleted."}, status=status.HTTP_204_NO_CONTENT)







