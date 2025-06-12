from django.urls import path
from .views import list_blogs, register_user, logout_user, flight_search_view, airport_autocomplete_view, hotel_search_view, city_autocomplete_view
from .views import attractions_search_view, post_blog_view, blog_details_view
from .views import increment_reads, like_post, post_or_get_comment, list_favourites, comment_detail
from .views import update_user, update_user_password, current_user, user_travel_preferences, suggestions
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

    path('blog/<int:blog_id>/likes/', like_post, name='like_post'),

    path('blog/<int:blog_id>/comments/', post_or_get_comment, name='post_comment'),

    path('blog/<int:blog_id>/comments/<int:comment_id>/', comment_detail, name='comment_detail'),

    path('favourites/', list_favourites, name='list_favourites'),

    path('update_user/', update_user, name='update_user'),

    path('update_user_password/', update_user_password, name='update_user_password'),
    
    # User travel preferences endpoints
    path('travel_preferences/', user_travel_preferences, name='user_travel_preferences'),
    path('suggestions/', suggestions, name='suggestions'),
    
    path('current_user/', current_user, name='current_user'),
]
