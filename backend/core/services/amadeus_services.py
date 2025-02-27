from amadeus import Client, ResponseError

# Initialize the Amadeus Client with your credentials
amadeus = Client(
    client_id='O7pD1o2pyRt6urRSAfObUktyO8d5ebMT',
    client_secret='GcOrQ608lnZPkTY8'
)


# Function to fetch airport suggestions using Amadeus API
def search_airports(query):
    try:
        response = amadeus.reference_data.locations.get(
            keyword=query,
            subType="AIRPORT,CITY",
            page={"limit": 5}  # Limit results to 5 suggestions
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

# Function to fetch airline name based on IATA code
def get_airline_name(iata_code):
    try:
        response = amadeus.reference_data.airlines.get(airlineCodes=iata_code)
        if response.data:
            return response.data[0].get("commonName", iata_code)  # Return airline name if available
        return iata_code  # Return IATA code if no name found
    except ResponseError:
        return iata_code  # Return IATA code in case of an error


def search_flights(origin, destination, departure_date, return_date=None, adults=1):
    try:
        kwargs = {
            "originLocationCode": origin,
            "destinationLocationCode": destination,
            "departureDate": departure_date,
            "adults": adults,
            "max": 10  # Limit to 10 results
        }

        if return_date:
            kwargs["returnDate"] = return_date  # Ensure returnDate is included

        # Debugging: Print the actual API request being sent
        print(f"Sending request to Amadeus with parameters: {kwargs}")

        # Fetch flights from Amadeus
        response = amadeus.shopping.flight_offers_search.get(**kwargs)

        flight_data = []
        for flight in response.data:
            itineraries = flight.get("itineraries", [])



            # Extract outbound itinerary (first itinerary)
            outbound_segments = itineraries[0]["segments"] if len(itineraries) > 0 else []
            outbound_first_segment = outbound_segments[0] if outbound_segments else {}
            outbound_last_segment = outbound_segments[-1] if outbound_segments else {}

            # Extract return itinerary (second itinerary, if available)
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
                } if return_date else None  # Only include if a return date was requested
            })

        return flight_data

    except ResponseError as error:
        return {"error": str(error)}


def get_hotel_id(cityCode):
    try:
        response = amadeus.reference_data.locations.hotels.by_city.get(cityCode=cityCode)

        if not response.data:
            return {"error": "No hotels found for this city."}

        #  Extract all hotel IDs
        hotel_ids = [hotel["hotelId"] for hotel in response.data]


        return hotel_ids

    except ResponseError as error:
        print(f" Amadeus API Error: {error.response.result}")
        return {"error": str(error)}


def search_hotels(cityCode, checkInDate, checkOutDate, adults):
    try:
        hotel_ids = get_hotel_id(cityCode)
        if "error" in hotel_ids:
            return hotel_ids

        # Limit to 10 hotels to avoid API errors
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
                # Extract room details safely
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



def search_cities (query):
    try:
        response = amadeus.reference_data.locations.get(
            keyword=query,
            subType="CITY",
            page={"limit": 5}  # Limit results to 5 suggestions
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
                if activity.get("bookingLink")  # Filter out activities without booking links
                if activity.get("pictures")  # Filter out activities without pictures
            ]

        return {"error": "No activities found"}
    except ResponseError as error:
        return {"error": str(error)}









