package controller;

import entity.UserEntity;
import dao.UserDao;

import com.fasterxml.jackson.core.JsonGenerationException;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.io.PrintWriter;
import java.io.IOException;
import java.util.Map;
import java.util.HashMap;
import java.security.SecureRandom;
import java.util.Base64;

import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@WebServlet("/api/auth/*")
public class AuthController extends HttpServlet {
    private static final Base64.Encoder base64 = Base64.getUrlEncoder();
    
    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        String path = request.getPathInfo();
        
        switch (path) {
            case "/login" -> handleLogin(request, response);
            case "/register" -> handleRegister(request, response);
            default -> throw new IOException("File path cannot be null");
        };
    }
    
    private void handleLogin(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        try {
            ObjectMapper mapper = new ObjectMapper();
            
            UserDao userDao = new UserDao();
            UserEntity user = mapper.readValue(request.getInputStream(), UserEntity.class);
            
            UserEntity existingUser = userDao.getEntityByEmail(user.getEmail());
            
            Map<String, Object> jsonResponse = new HashMap<>();

            if (existingUser != null && existingUser.getPassword().equals(user.getPassword())) {
                jsonResponse.put("token", generateAuthToken());
                jsonResponse.put("user", existingUser);
                
                response.setContentType("application/json");
                mapper.writeValue(response.getWriter(), jsonResponse);
            }
        } catch (JsonGenerationException e) {
            e.printStackTrace();
        }
    }
    
    private void handleRegister(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        try {
            ObjectMapper mapper = new ObjectMapper();
            UserDao userDao = new UserDao();
            
            UserEntity newUser = mapper.readValue(request.getInputStream(), UserEntity.class);
            
            Map<String, Object> jsonResponse = new HashMap<>();
            
            if (userDao.create(newUser)) {
                jsonResponse.put("token", generateAuthToken());
                jsonResponse.put("user", newUser);    
                
                
                response.setContentType("application/json");
                mapper.writeValue(response.getWriter(), jsonResponse);
            }
            
        } catch (JsonGenerationException e) {
            e.printStackTrace();
        }
    }
    
    private String generateAuthToken() {
        byte[] randomBytes = new byte[24];
        new SecureRandom().nextBytes(randomBytes);
        return base64.withoutPadding().encodeToString(randomBytes);
    }
}