package com.example;

import java.io.PrintWriter;
import java.io.IOException;
import jakarta.servlet.ServletException;
//import javax.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
 
//@WebServlet("/hello")
public class HelloServlet extends HttpServlet {
 
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
         
        response.setContentType("text/html");
        PrintWriter writer = response.getWriter();
        try {
            writer.println("<html><body>");
            writer.println("<h2>Hello from HelloServlet</h2>");
            writer.println("</body></html>");
        } finally {
            writer.close();  
        }
    }
}