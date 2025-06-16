from amadeus import Client, ResponseError

import os
from dotenv import load_dotenv

load_dotenv()

API_KEY = os.getenv('AMADEUS_API_KEY')
API_SECRET = os.getenv('AMADEUS_API_SECRET')


amadeus = Client(
    client_id=API_KEY,
    client_secret=API_SECRET
)

"""
Returns a list of up to 5 airports and cities matching the query string
"""

def search_airports(query):
    try:
        response = amadeus.reference_data.locations.get(
            keyword=query,
            subType="AIRPORT,CITY",
            page={"limit": 5}
        )

        if response.data:
            return [
                {
                    "airport_name": airport.get("name", "Unknown Airport"),
                    "iata_code": airport.get("iataCode", "N/A"),
                    "city_name": airport.get("address", {}).get("cityName", "Unknown City")
                }
                for airport in response.data
            ]

        return []

    except ResponseError as error:
        return {"error": str(error)}

"""
Returns the common name of an airline given its IATA code
"""
def get_airline_name(iata_code):
    try:
        response = amadeus.reference_data.airlines.get(airlineCodes=iata_code)
        if response.data:
            return response.data[0].get("commonName", iata_code) 
        return iata_code 
    except ResponseError:
        return iata_code 

"""
Search for flights between two airports on a specific date
"""
def search_flights(origin, destination, departure_date, return_date=None, adults=1):
    try:
        kwargs = {
            "originLocationCode": origin,
            "destinationLocationCode": destination,
            "departureDate": departure_date,
            "adults": adults,
            "max": 10 
        }

        if return_date:
            kwargs["returnDate"] = return_date  

        print(f"Sending request to Amadeus with parameters: {kwargs}")

        response = amadeus.shopping.flight_offers_search.get(**kwargs)

        flight_data = []
        for flight in response.data:
            itineraries = flight.get("itineraries", [])



            outbound_segments = itineraries[0]["segments"] if len(itineraries) > 0 else []
            outbound_first_segment = outbound_segments[0] if outbound_segments else {}
            outbound_last_segment = outbound_segments[-1] if outbound_segments else {}

            return_segments = itineraries[1]["segments"] if len(itineraries) > 1 else []
            return_first_segment = return_segments[0] if return_segments else {}
            return_last_segment = return_segments[-1] if return_segments else {}

            flight_data.append({
                "airline": get_airline_name(flight["validatingAirlineCodes"][0])
                if "validatingAirlineCodes" in flight else "Unknown",
                "price": flight["price"]["total"],
                "currency": flight["price"]["currency"],
                "outbound": {
                    "duration": itineraries[0]["duration"] if len(itineraries) > 0 else "N/A",
                    "from": outbound_first_segment.get("departure", {}).get("iataCode", "Unknown"),
                    "to": outbound_last_segment.get("arrival", {}).get("iataCode", "Unknown"),
                    "segments": [
                        {
                            "departure": segment["departure"]["iataCode"],
                            "arrival": segment["arrival"]["iataCode"],
                            "departureTime": segment["departure"]["at"],
                            "arrivalTime": segment["arrival"]["at"],
                            "duration": segment.get("duration", "N/A"),
                            "airline": get_airline_name(segment.get("carrierCode", "Unknown")),
                        }
                        for segment in outbound_segments
                    ]
                },
                "return": {
                    "duration": itineraries[1]["duration"] if len(itineraries) > 1 else "N/A",
                    "from": return_first_segment.get("departure", {}).get("iataCode", "Unknown"),
                    "to": return_last_segment.get("arrival", {}).get("iataCode", "Unknown"),
                    "segments": [
                        {
                            "departure": segment["departure"]["iataCode"],
                            "arrival": segment["arrival"]["iataCode"],
                            "departureTime": segment["departure"]["at"],
                            "arrivalTime": segment["arrival"]["at"],
                            "duration": segment.get("duration", "N/A"),
                            "airline": get_airline_name(segment.get("carrierCode", "Unknown")),
                        }
                        for segment in return_segments
                    ]
                } if return_date else None 
            })

        return flight_data

    except ResponseError as error:
        return {"error": str(error)}

"""
Returns a list of hotel IDs for a specific city code
"""
def get_hotel_id(cityCode):
    try:
        response = amadeus.reference_data.locations.hotels.by_city.get(cityCode=cityCode)

        if not response.data:
            return {"error": "No hotels found for this city."}

        hotel_ids = [hotel["hotelId"] for hotel in response.data]


        return hotel_ids

    except ResponseError as error:
        print(f" Amadeus API Error: {error.response.result}")
        return {"error": str(error)}

"""
Search for hotels in a specific city on a specific date range
"""
def search_hotels(cityCode, checkInDate, checkOutDate, adults):
    try:
        hotel_ids = get_hotel_id(cityCode)
        if "error" in hotel_ids:
            return hotel_ids

        hotel_ids = hotel_ids[:35]

        kwargs = {
            "hotelIds": ",".join(hotel_ids),
            "checkInDate": checkInDate,
            "checkOutDate": checkOutDate,
            "adults": str(adults),
            "roomQuantity": "1",
            "currency": "USD",
            "bestRateOnly": "true",
            "view": "FULL"
        }

        response = amadeus.shopping.hotel_offers_search.get(**kwargs)
        

        if not response.data:
            return {"error": "No hotel offers available."}

        hotel_data = []
        for hotel in response.data:
            hotel_info = hotel.get("hotel", {})
            offers = hotel.get("offers", [])

            if not offers:
                continue

            for offer in offers:
                room_info = offer.get("room", {}).get("typeEstimated", {})
                cancellation_policy = offer.get("policies", {}).get("cancellation", {}).get("description", {}).get("text", "No cancellation policy")

                hotel_data.append({
                    "hotel_id": hotel_info.get("hotelId", "Unknown"),
                    "name": hotel_info.get("name", "Unknown"),
                    "city_code": hotel_info.get("cityCode", "Unknown"),
                    "latitude": hotel_info.get("latitude", None),
                    "longitude": hotel_info.get("longitude", None),
                    "available": hotel.get("available", False),
                    "room_type": room_info.get("category", "N/A"),
                    "beds": room_info.get("beds", "N/A"),
                    "bed_type": room_info.get("bedType", "N/A"),
                    "room_description": offer.get("room", {}).get("description", {}).get("text", "No description"),
                    "price": offer.get("price", {}).get("total", "N/A"),
                    "currency": offer.get("price", {}).get("currency", "N/A"),
                    "payment_type": offer.get("policies", {}).get("paymentType", "N/A"),
                    "cancellation_policy": cancellation_policy,
                    "api_link": offer.get("self", "N/A")
                })

        return hotel_data

    except ResponseError as error:
        return {"error": str(error)}

"""
Search for cities based on a query string
"""
def search_cities (query):
    try:
        response = amadeus.reference_data.locations.get(
            keyword=query,
            subType="CITY",
            page={"limit": 5}  
        )

        if response.data:
            return [
                {
                    "city_name": city.get("name", "Unknown City"),
                    "iata_code": city.get("iataCode", "N/A"),
                    "country_name": city.get("address", {}).get("countryName", "Unknown Country"),
                    "latitude": city.get("geoCode", {}).get("latitude", None),
                    "longitude": city.get("geoCode", {}).get("longitude", None)
                }
                for city in response.data
            ]

        return []

    except ResponseError as error:
        return {"error": str(error)}

"""
Search for attractions based on a latitude and longitude
"""
def search_attractions(latitude, longitude, radius=20):
    try:
        response = amadeus.shopping.activities.get(
            latitude=latitude,
            longitude=longitude,
            radius=radius
        )

        if response.data:
            return [
                {
                    "name": activity.get("name", "Unknown Activity"),
                    "short_description": activity.get("shortDescription", "No description available"),
                    "latitude": activity.get("geoCode", {}).get("latitude", "N/A"),
                    "longitude": activity.get("geoCode", {}).get("longitude", "N/A"),
                    "rating": activity.get("rating", "N/A"),
                    "image": activity.get("pictures")[0] if activity.get("pictures") else "https://via.placeholder.com/150",
                    "price": activity.get("price", {}).get("amount", "N/A"),
                    "currency": activity.get("price", {}).get("currencyCode", "N/A"),
                    "booking_link": activity.get("bookingLink", "N/A"),
                }
                for activity in response.data
                if activity.get("bookingLink")  
                if activity.get("pictures")  
            ]

        return {"error": "No activities found"}
    except ResponseError as error:
        return {"error": str(error)}









