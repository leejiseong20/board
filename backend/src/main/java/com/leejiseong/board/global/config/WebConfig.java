package com.leejiseong.board.global.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.ViewControllerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Value("${file.upload.dir}")
    private String uploadDir;

    @Override
    public void addViewControllers(ViewControllerRegistry registry) {
        registry.addViewController("/{spring:[^.]*}")
                .setViewName("forward:/index.html");

        registry.addViewController("/**/{spring:[^.]*}")
                .setViewName("forward:/index.html");
    }

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // uploadDir 값을 그대로 사용 (로컬: D:/board-uploads, 서버: /home/ubuntu/board-uploads)
        String location = uploadDir.startsWith("/")
                ? "file://" + uploadDir + "/"          // Linux 절대경로
                : "file:///" + uploadDir + "/";         // Windows 경로

        registry.addResourceHandler("/api/upload/images/**")
                .addResourceLocations(location);
    }
}
