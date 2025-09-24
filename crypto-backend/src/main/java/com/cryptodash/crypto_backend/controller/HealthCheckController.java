package com.cryptodash.crypto_backend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class HealthCheckController {
    @GetMapping("/")
    public ResponseEntity<String> checkHealth(){
        return ResponseEntity.ok("Ok");
    }
}


//This is use for health check on AWS