package com.example.map.geo;

import com.fasterxml.jackson.databind.JsonNode;
import org.springframework.web.bind.annotation.*;

/**
 * REST controller for geocoding and location services.
 * Provides endpoints for text-based searches and coordinate-based searches.
 */
@RestController
@RequestMapping("/api/geo")
public class GeoController {

  private final GoogleApi31Service googleApiService;
  
  /**
   * Constructor for dependency injection.
   * 
   * @param googleApiService The Google API service instance
   */
  public GeoController(GoogleApi31Service googleApiService) {
    this.googleApiService = googleApiService;
  }

  /**
   * Performs a text-based location search.
   * Suitable for search input fields where users enter addresses or place names.
   * 
   * @param text Search text (e.g., "white house")
   * @param place Place name (e.g., "washington dc")
   * @param city City name
   * @param state State name
   * @param country Country name
   * @param postcode Postal code
   * @return JSON response with location data
   * @throws Exception If the API call fails
   */
  @GetMapping("/text")
  public JsonNode text(@RequestParam(required=false) String text,
                       @RequestParam(required=false) String place,
                       @RequestParam(required=false) String city,
                       @RequestParam(required=false) String state,
                       @RequestParam(required=false) String country,
                       @RequestParam(required=false) String postcode) throws Exception {
    return googleApiService.byText(text, place, city, state, country, postcode);
  }

  /**
   * Performs a circular range search around a center point.
   * Finds locations within a specified radius of given coordinates.
   * 
   * @param lat Latitude of center point
   * @param lon Longitude of center point
   * @param radius Search radius in meters (default: 1000)
   * @param text Optional keyword to filter results
   * @return JSON response with location data
   * @throws Exception If the API call fails
   */
  @GetMapping("/circle")
  public JsonNode circle(@RequestParam("lat") double lat,
                         @RequestParam("lon") double lon,
                         @RequestParam(defaultValue = "1000") int radius,
                         @RequestParam(required=false) String text) throws Exception {
    return googleApiService.byCircle(lat, lon, text, radius);
  }

  /**
   * Raw passthrough endpoint for direct API queries.
   * Accepts a JSON body with any valid API parameters.
   * 
   * @param body Map of query parameters
   * @return JSON response from the API
   * @throws Exception If the API call fails
   */
  @PostMapping("/raw")
  public JsonNode raw(@RequestBody java.util.Map<String,Object> body) throws Exception {
    return googleApiService.query(body);
  }
}
