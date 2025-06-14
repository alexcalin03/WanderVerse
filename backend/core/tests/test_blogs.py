import pytest
from django.urls import reverse
from rest_framework import status
from core.models import BlogPost, UserTravelPreferences, Comment


@pytest.mark.django_db
def test_list_blogs_unauthorized(api_client):
    response = api_client.get('/blogs/')
    assert response.status_code in [status.HTTP_200_OK, status.HTTP_401_UNAUTHORIZED, status.HTTP_403_FORBIDDEN]


@pytest.mark.django_db
def test_list_blogs_authorized(authenticated_client, test_user):
    response = authenticated_client.get('/blogs/')
    assert response.status_code == status.HTTP_200_OK
    assert isinstance(response.data, dict)


@pytest.mark.django_db
def test_create_blog_post(authenticated_client, test_user):
    data = {
        'title': 'Test Blog Post',
        'content': 'This is a test blog post created during testing.',
        'location': 'Test City, Test Country',
        'cityCode': 'TST'
    }
    
    response = authenticated_client.post('/blog/', data, format='json')
    assert response.status_code in [status.HTTP_201_CREATED, status.HTTP_200_OK]
    
    assert BlogPost.objects.filter(title='Test Blog Post').exists()
    blog_post = BlogPost.objects.get(title='Test Blog Post')
    assert blog_post.user == test_user
    assert blog_post.content == 'This is a test blog post created during testing.'


@pytest.mark.django_db
def test_get_individual_blog(authenticated_client, test_user):
    blog = BlogPost.objects.create(
        title='Test Individual Blog',
        content='Content for individual blog test',
        user=test_user,
        location='Test Location'
    )
    
    response = authenticated_client.get(f'/blog/{blog.id}/')
    assert response.status_code == status.HTTP_200_OK
    # The blog data is nested under the 'blog' key in the response
    assert response.data['blog']['title'] == 'Test Individual Blog'
    assert 'comments' in response.data
    assert 'is_liked' in response.data

    response = authenticated_client.get('/suggestions/')
    assert response.status_code == status.HTTP_200_OK
    assert 'suggestions' in response.data


@pytest.mark.django_db
def test_create_comment(authenticated_client, test_user):
    # First create a blog post to comment on
    blog = BlogPost.objects.create(
        title='Test Blog for Comment',
        content='Content for testing comment creation',
        user=test_user,
        location='Test Location'
    )
    
    # Create a comment on the blog post
    comment_data = {
        'content': 'This is a test comment'
    }
    response = authenticated_client.post(f'/blog/{blog.id}/comments/', comment_data, format='json')
    
    # Assert the comment was created successfully
    assert response.status_code == status.HTTP_201_CREATED
    
    # Check the comment exists in the database
    assert Comment.objects.filter(blog_post=blog, user=test_user).exists()
    comment = Comment.objects.get(blog_post=blog, user=test_user)
    assert comment.content == 'This is a test comment'


@pytest.mark.django_db
def test_delete_comment(authenticated_client, test_user):
    # Create a blog post
    blog = BlogPost.objects.create(
        title='Test Blog for Comment Deletion',
        content='Content for testing comment deletion',
        user=test_user,
        location='Test Location'
    )
    
    # Create a comment directly in the database
    comment = Comment.objects.create(
        user=test_user,
        blog_post=blog,
        content='Comment to be deleted'
    )
    
    # Delete the comment
    response = authenticated_client.delete(f'/blog/{blog.id}/comments/{comment.id}/')
    
    # Assert the comment was deleted successfully
    assert response.status_code == status.HTTP_204_NO_CONTENT
    
    # Verify the comment no longer exists
    assert not Comment.objects.filter(id=comment.id).exists()


@pytest.mark.django_db
def test_delete_blog_post(authenticated_client, test_user):
    # Create a blog post
    blog = BlogPost.objects.create(
        title='Test Blog for Deletion',
        content='Content for testing blog deletion',
        user=test_user,
        location='Test Location'
    )
    
    # Delete the blog post
    response = authenticated_client.delete(f'/blog/{blog.id}/')
    
    # Assert the blog was deleted successfully
    assert response.status_code == status.HTTP_204_NO_CONTENT
    
    # Verify the blog no longer exists
    assert not BlogPost.objects.filter(id=blog.id).exists()


@pytest.mark.django_db
def test_get_comment(authenticated_client, test_user):
    # Create a blog post
    blog = BlogPost.objects.create(
        title='Test Blog for Getting Comment',
        content='Content for testing getting a comment',
        user=test_user,
        location='Test Location'
    )
    
    # Create a comment
    comment = Comment.objects.create(
        user=test_user,
        blog_post=blog,
        content='Comment to be retrieved'
    )
    
    # Get the comment
    response = authenticated_client.get(f'/blog/{blog.id}/comments/{comment.id}/')
    
    # Assert the comment was retrieved successfully
    assert response.status_code == status.HTTP_200_OK
    assert response.data['content'] == 'Comment to be retrieved'
    # Check for author_username field which is what the serializer returns
    assert response.data['author_username'] == test_user.username


@pytest.mark.django_db
def test_increment_reads(authenticated_client, test_user):
    # Create a blog post with initial read count of 0
    blog = BlogPost.objects.create(
        title='Test Blog for Incrementing Reads',
        content='Content for testing read count incrementing',
        user=test_user,
        location='Test Location',
        reads=0
    )
    
    # Get the initial read count
    initial_reads = blog.reads
    
    # Increment the reads
    response = authenticated_client.post(f'/blog/{blog.id}/reads/')
    
    # Assert the response is successful
    assert response.status_code == status.HTTP_200_OK
    
    # Refresh the blog post from the database
    blog.refresh_from_db()
    
    # Verify the read count has been incremented
    assert blog.reads == initial_reads + 1


@pytest.mark.django_db
def test_like_post(authenticated_client, test_user):
    # Create a blog post
    blog = BlogPost.objects.create(
        title='Test Blog for Liking',
        content='Content for testing post liking functionality',
        user=test_user,
        location='Test Location'
    )
    
    # Like the post
    response = authenticated_client.post(f'/blog/{blog.id}/likes/')
    
    # Assert the response is successful
    assert response.status_code == status.HTTP_200_OK
    
    # Verify the post is liked by the user
    assert blog.liked_by.filter(id=test_user.id).exists()
    assert 'likes_count' in response.data
    assert response.data['message'] == 'Post liked successfully.'
    
    # Test unliking the post
    response = authenticated_client.delete(f'/blog/{blog.id}/likes/')
    
    # Assert the response is successful
    assert response.status_code == status.HTTP_200_OK
    
    # Verify the post is no longer liked by the user
    assert not blog.liked_by.filter(id=test_user.id).exists()
