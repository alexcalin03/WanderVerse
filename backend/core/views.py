from django.shortcuts import render
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from django.contrib.auth.models import User
from django.http import JsonResponse
from .services.amadeus_services import search_flights, search_airports, search_hotels

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

    check_in = request.GET.get('checkIn', '2025-03-03')
    check_out = request.GET.get('checkOut', '2025-03-10')
    adults = request.GET.get('adults', 1)

    hotel_data = search_hotels(city_code, check_in, check_out, adults)

    return JsonResponse(hotel_data, safe=False)



