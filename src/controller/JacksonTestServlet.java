package controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import java.io.IOException;
import java.util.Map;
import java.util.HashMap;

import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@WebServlet("/api/test-jackson")
public class JacksonTestServlet extends HttpServlet {
    
    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) 
            throws ServletException, IOException {
        
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        
        // Try to use Jackson
        try {
            ObjectMapper mapper = new ObjectMapper();
            
            Map<String, Object> data = new HashMap<>();
            data.put("status", "OK");
            data.put("message", "Jackson is working!");
            data.put("jackson_version", mapper.version().toString());
            
            mapper.writeValue(response.getWriter(), data);
            
        } catch (Exception e) {
            // If Jackson not found, this will fail
            response.getWriter().write(
                "{\"status\":\"ERROR\", \"message\":\"" + e.getMessage() + "\"}"
            );
        }
    }
}