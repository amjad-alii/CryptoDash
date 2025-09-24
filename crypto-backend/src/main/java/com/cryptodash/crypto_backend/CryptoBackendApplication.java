package com.cryptodash.crypto_backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class CryptoBackendApplication {

	public static void main(String[] args) {
		SpringApplication.run(CryptoBackendApplication.class, args);
		System.out.println("hello from crypto");
	}

}
