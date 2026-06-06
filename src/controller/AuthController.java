package controller;

import entity.UserEntity;

import com.fasterxml.jackson.core.JsonGenerationException;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.io.PrintWriter;
import java.io.IOException;
import java.util.Map;
import java.util.HashMap;

import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@WebServlet("/api/auth/login")
public class AuthController extends HttpServlet {

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        
        try {
            ObjectMapper mapper = new ObjectMapper();
             
            UserEntity user = mapper.readValue(request.getInputStream(), UserEntity.class);
            
            Map<String, Object> jsonResponse = new HashMap<>();

            
            if (user.getEmail().equals("s")) {
                jsonResponse.put("token", "test_token");
                jsonResponse.put("user", user);
                
                response.setContentType("application/json");
                mapper.writeValue(response.getWriter(), jsonResponse);
            }
            
             
            
        } catch (JsonGenerationException e) {
            e.printStackTrace();
        }
        
    }
}