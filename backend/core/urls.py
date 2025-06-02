from django.urls import path
from .views import register_user, logout_user, flight_search_view, airport_autocomplete_view, hotel_search_view, city_autocomplete_view
from .views import attractions_search_view, post_blog_view, blog_details_view

urlpatterns = [
    path('register/', register_user),
    path('logout/', logout_user),

    path('flights/', flight_search_view, name='flight_search'),

    path('airports/', airport_autocomplete_view, name='airport_autocomplete'),

    path('hotels/', hotel_search_view, name='hotel_search'),

    path('cities/', city_autocomplete_view, name='city_autocomplete'),

    path('attractions/', attractions_search_view, name='attractions_search'),

    path('blog/', post_blog_view, name='post_blog'),

    path('blog/<int:blog_id>/', blog_details_view, name='get_blog'),
]
