package com.example.map.geo;

import com.fasterxml.jackson.databind.JsonNode;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(GeoController.class)
public class GeoControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private GoogleApi31Service service;

    @Test
    public void testTextSearch() throws Exception {
        // Mock response
        JsonNode mockResponse = new com.fasterxml.jackson.databind.ObjectMapper()
            .readTree("{\"status\":\"OK\",\"results\":[{\"name\":\"Test Place\"}]}");
        
        when(service.byText(anyString(), anyString(), anyString(), anyString(), anyString(), anyString()))
            .thenReturn(mockResponse);

        mockMvc.perform(get("/api/geo/text")
                .param("text", "white house")
                .param("place", "washington dc"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("OK"));
    }

    @Test
    public void testCircleSearch() throws Exception {
        // Mock response
        JsonNode mockResponse = new com.fasterxml.jackson.databind.ObjectMapper()
            .readTree("{\"status\":\"OK\",\"results\":[{\"name\":\"Restaurant\"}]}");
        
        when(service.byCircle(anyDouble(), anyDouble(), anyString(), anyInt()))
            .thenReturn(mockResponse);

        mockMvc.perform(get("/api/geo/circle")
                .param("lat", "38.8977")
                .param("lon", "-77.0365")
                .param("radius", "50000")
                .param("text", "restaurant"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("OK"));
    }

    @Test
    public void testRawQuery() throws Exception {
        // Mock response
        JsonNode mockResponse = new com.fasterxml.jackson.databind.ObjectMapper()
            .readTree("{\"status\":\"OK\",\"results\":[]}");
        
        when(service.query(anyMap())).thenReturn(mockResponse);

        mockMvc.perform(post("/api/geo/raw")
                .contentType("application/json")
                .content("{\"text\":\"white house\",\"place\":\"washington DC\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("OK"));
    }
}

