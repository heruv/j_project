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

@WebServlet("/api/events/chat/*") 
public class ChatController extends HttpServlet {

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        response.setContentType("application/json");
        
        try {
            ObjectMapper mapper = new ObjectMapper();
            
            mapper.writeValue()
        }
    }
}