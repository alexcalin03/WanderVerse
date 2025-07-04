from core.models import BlogPost, Comment

"""
Helper function for paginating blogs for the blog listing view
"""
def get_blogs(page=1, per_page=5, username=None):
    try:
        page = int(page)
        per_page = int(per_page)
        if page < 1:
            page = 1
        
        if username and username.lower() != 'null':
            blogs_query = BlogPost.objects.filter(user__username=username).order_by('-created_at')
        else:
            blogs_query = BlogPost.objects.all().order_by('-created_at')
            
        total_count = blogs_query.count()
        
        start = (page - 1) * per_page
        end = start + per_page
        blogs = blogs_query[start:end]
        
        total_pages = (total_count + per_page - 1) // per_page
        return {
            "results": blogs,
            "page": page,
            "per_page": per_page,
            "total_count": total_count,
            "total_pages": total_pages,
        }
    except Exception as e:
        print(f"Error getting blogs: {e}")
        return None


def increment_reads(blog_id):
    try:
        blog = BlogPost.objects.get(id=blog_id)
        blog.reads += 1
        blog.save()
        return True
    except Exception as e:
        print(f"Error incrementing reads: {e}")
        return False



"""
Helper function for paginating comments for a specific blog post
"""
def get_comments_helper(blog_id, page=1, per_page=15):
    try:
        blog = BlogPost.objects.get(id=blog_id)
        page = int(page)
        per_page = int(per_page)
        if page < 1:
            page = 1
        start = (page - 1) * per_page
        end = start + per_page
        comments_qs = Comment.objects.filter(blog_post=blog).order_by('-created_at')
        total_count = comments_qs.count()
        total_pages = (total_count + per_page - 1) // per_page
        comments = comments_qs[start:end]
        return {
            "results": comments,
            "page": page,
            "per_page": per_page,
            "total_count": total_count,
            "total_pages": total_pages,
        }
    except Exception as e:
        print(f"Error getting comments: {e}")
        return None




    
    


    