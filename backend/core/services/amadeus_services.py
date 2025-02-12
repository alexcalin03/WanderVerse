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

