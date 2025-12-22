package com.example.map.geo;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.Map;

/**
 * Service for interacting with Google API via RapidAPI.
 * Handles geocoding and location-based queries.
 */
@Service
public class GoogleApi31Service {

  @Value("${googleapi31.rapidapi.host}") 
  private String rapidApiHost;
  
  @Value("${googleapi31.rapidapi.key}")  
  private String rapidApiKey;
  
  @Value("${googleapi31.endpoint}")      
  private String apiEndpoint;

  private final HttpClient httpClient = HttpClient.newBuilder()
      .connectTimeout(Duration.ofSeconds(10))
      .build();
      
  private final ObjectMapper objectMapper = new ObjectMapper();

  /**
   * Sends a query to the Google API via RapidAPI.
   * Accepts parameters: text, place, street, city, country, state, postcode, latitude, longitude, radius.
   * 
   * @param params Map of query parameters
   * @return JSON response from the API
   * @throws Exception If the HTTP request fails
   */
  public JsonNode query(Map<String, Object> params) throws Exception {
    ObjectNode requestBody = objectMapper.createObjectNode();
    
    // Only include non-null values in the request body
    params.forEach((key, value) -> {
      if (value == null) return;
      if (value instanceof Number) {
        requestBody.putPOJO(key, value);
      } else {
        requestBody.put(key, String.valueOf(value));
      }
    });

    HttpRequest request = HttpRequest.newBuilder(URI.create(apiEndpoint))
        .header("Content-Type", "application/json")
        .header("x-rapidapi-host", rapidApiHost)
        .header("x-rapidapi-key", rapidApiKey)
        .POST(HttpRequest.BodyPublishers.ofString(requestBody.toString(), StandardCharsets.UTF_8))
        .build();

    HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
    return objectMapper.readTree(response.body());
  }

  /**
   * Performs a text-based location search.
   * 
   * @param text Search text
   * @param place Place name
   * @param city City name
   * @param state State name
   * @param country Country name
   * @param postcode Postal code
   * @return JSON response with location data
   * @throws Exception If the API call fails
   */
  public JsonNode byText(String text, String place, String city, String state, String country, String postcode) throws Exception {
    return query(Map.of(
        "text", normalizeString(text),
        "place", normalizeString(place),
        "city", normalizeString(city),
        "state", normalizeString(state),
        "country", normalizeString(country),
        "postcode", normalizeString(postcode)
    ));
  }

  /**
   * Performs a circular range search around a center point.
   * 
   * @param latitude Center point latitude
   * @param longitude Center point longitude
   * @param text Optional keyword to filter results
   * @param radiusMeters Search radius in meters
   * @return JSON response with location data
   * @throws Exception If the API call fails
   */
  public JsonNode byCircle(double latitude, double longitude, String text, int radiusMeters) throws Exception {
    return query(Map.of(
        "latitude", latitude,
        "longitude", longitude,
        "radius", radiusMeters,
        "text", normalizeString(text)
    ));
  }

  /**
   * Normalizes a string value, converting null or blank strings to empty string.
   * 
   * @param value The string to normalize
   * @return Empty string if null or blank, otherwise the original string
   */
  private static String normalizeString(String value) {
    return (value == null || value.isBlank()) ? "" : value;
  }
}
