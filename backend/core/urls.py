from django.urls import path
from .views import register_user, logout_user, flight_search_view, airport_autocomplete_view

urlpatterns = [
    path('register/', register_user),
    path('logout/', logout_user),

    path('flights/', flight_search_view, name='flight_search'),

    path('airports/', airport_autocomplete_view, name='airport_autocomplete')
]
