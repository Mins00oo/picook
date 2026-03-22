package com.picook;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class PicookApplication {

    public static void main(String[] args) {
        SpringApplication.run(PicookApplication.class, args);
    }
}
