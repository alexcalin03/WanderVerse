from django.urls import path
from .views import list_blogs, register_user, logout_user, flight_search_view, airport_autocomplete_view, hotel_search_view, city_autocomplete_view
from .views import attractions_search_view, post_blog_view, blog_details_view
from .views import increment_reads, increment_likes, post_or_get_comment, get_blogs

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

    path('blogs/', list_blogs, name='list_blogs'),

    path('blog/<int:blog_id>/reads/', increment_reads, name='increment_reads'),

    path('blog/<int:blog_id>/likes/', increment_likes, name='increment_likes'),

    path('blog/<int:blog_id>/comments/', post_or_get_comment, name='post_comment'),

]
