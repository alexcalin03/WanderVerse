from locust import HttpUser, task, between
import random
import string

def random_username():
    return "user_" + ''.join(random.choices(string.ascii_lowercase + string.digits, k=8))

class WebsiteUser(HttpUser):
    wait_time = between(0.5, 2.0)  # Simulate real user wait time

    def on_start(self):
        # Register a user
        username = random_username()
        password = "Testpass123!"
        email = f"{username}@test.com"
        self.client.post("/register/", json={
            "username": username,
            "password": password,
            "email": email
        })
        # Login
        login_res = self.client.post("/api/token/", json={
            "username": username,
            "password": password
        })
        if login_res.status_code == 200 and 'token' in login_res.json():
            self.token = login_res.json()['token']
            self.headers = {"Authorization": f"Token {self.token}"}
        else:
            self.token = None
            self.headers = {}

        # Create a blog post to interact with
        if self.token:
            payload = {
                "title": "Locust Test Post",
                "content": "Stress testing blog creation with Locust.",
                "location": "Testville, Country"
            }
            response = self.client.post("/blog/", json=payload, headers=self.headers)
            if response.status_code == 201:
                self.last_blog_id = response.json()['id']
            else:
                self.last_blog_id = None
        else:
            self.last_blog_id = None

    @task(1)
    def search_flights(self):
        if self.token:
            params = {
                "origin": "MAD",
                "destination": "ATH",
                "departureDate": "2025-11-03"
            }
            self.client.get("/flights/", params=params, headers=self.headers)

    @task(1)
    def search_hotels(self):
        if self.token:
            params = {
                "cityCode": "MAD",
                "checkInDate": "2025-11-03",
                "checkOutDate": "2025-11-10",
                "adults": 1
            }
            self.client.get("/hotels/", params=params, headers=self.headers)

    @task(1)
    def search_attractions(self):
        if self.token:
            params = {
                "latitude": "40.4168",
                "longitude": "-3.7038"
            }
            self.client.get("/attractions/", params=params, headers=self.headers)

    @task(1)
    def create_blog_post(self):
        if not self.token:
            return
        payload = {
            "title": "Locust Test Post",
            "content": "Stress testing blog creation with Locust.",
            "location": "Testville, Country"
        }
        response = self.client.post("/blog/", json=payload, headers=self.headers)
        if response.status_code == 201:
            self.last_blog_id = response.json()['id']
        else:
            self.last_blog_id = None

    @task(1)
    def like_blog_post(self):
        if self.token and self.last_blog_id:
            self.client.post(f"/blog/{self.last_blog_id}/likes/", headers=self.headers, name="blog/:id/likes")

    @task(1)
    def comment_on_blog_post(self):
        if self.token and self.last_blog_id:
            comment_text = "Automated Locust comment!"
            self.client.post(
                f"/blog/{self.last_blog_id}/comments/",
                json={"content": comment_text},
                headers=self.headers,
                name="blog/:id/comments"
            )

    @task(1)
    def get_suggestions(self):
        if self.token:
            self.client.get("/suggestions/", headers=self.headers)
