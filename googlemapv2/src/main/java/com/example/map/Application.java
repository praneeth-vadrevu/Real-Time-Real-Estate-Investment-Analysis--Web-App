package com.example.map;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.ComponentScan;

/**
 * Main Spring Boot application entry point.
 * Scans multiple packages to include map services, real estate services, and analysis services.
 */
@SpringBootApplication
@ComponentScan(basePackages = {"com.example.map", "com.example.realestate", "com.example.analysis"})
public class Application {
    /**
     * Application entry point.
     * 
     * @param args Command line arguments
     */
    public static void main(String[] args) {
        SpringApplication.run(Application.class, args);
    }
}

