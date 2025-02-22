from django.urls import path
from .views import register_user, logout_user, flight_search_view, airport_autocomplete_view, hotel_search_view, city_autocomplete_view

urlpatterns = [
    path('register/', register_user),
    path('logout/', logout_user),

    path('flights/', flight_search_view, name='flight_search'),

    path('airports/', airport_autocomplete_view, name='airport_autocomplete'),

    path('hotels/', hotel_search_view, name='hotel_search'),

    path('cities/', city_autocomplete_view, name='city_autocomplete'),
]
