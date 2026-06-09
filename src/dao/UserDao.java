package dao;

import entity.UserEntity;
import java.util.List;
import java.util.ArrayList;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;

import entity.UserEntity;

    public class UserDao extends BaseDao<UserEntity, Integer> {
    
    @Override
    public List<UserEntity> getAll() {
        List<UserEntity> lst = new ArrayList<>();
        ResultSet resultSet = null;
        String sql = "SELECT * FROM users ORDER BY id";

        try (Connection con = getConnection(); PreparedStatement statement = con.prepareStatement(sql)) {
            
            resultSet = statement.executeQuery();
            
            while (resultSet.next()) {
                UserEntity user = new UserEntity();
                
                user.setId(resultSet.getInt("id"));
                user.setName(resultSet.getString("name"));
                user.setEmail(resultSet.getString("email"));
                user.setPassword(resultSet.getString("password"));
                
                lst.add(user);
            }            
            
        } catch (SQLException e) {
            e.printStackTrace();
        }
        
        return lst;
    }
    
    @Override
    public UserEntity getEntityById(Integer id) {
        String sql = "SELECT * FROM users WHERE id = ?";
        ResultSet resultSet = null;

        try (Connection con = getConnection(); PreparedStatement statement = con.prepareStatement(sql)) {
            statement.setInt(1, id);
            
            resultSet = statement.executeQuery();
            
            while (resultSet.next()) {
                UserEntity user = new UserEntity();
                
                user.setId(resultSet.getInt("id"));
                user.setName(resultSet.getString("name"));
                user.setEmail(resultSet.getString("email"));
                user.setPassword(resultSet.getString("password"));
                
                return user;
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        
        return null;
    }
    
    public UserEntity getEntityByEmail(String email) {
        String sql = "SELECT * FROM users WHERE email = ?";
        ResultSet resultSet = null;

        try (Connection con = getConnection(); PreparedStatement statement = con.prepareStatement(sql)) {
            statement.setString(1, email);
            
            resultSet = statement.executeQuery();
            
            while (resultSet.next()) {
                UserEntity user = new UserEntity();
                
                user.setId(resultSet.getInt("id"));
                user.setName(resultSet.getString("name"));
                user.setEmail(resultSet.getString("email"));
                user.setPassword(resultSet.getString("password"));
                
                return user;
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        
        return null;
    }
    
    @Override
    public UserEntity update(UserEntity user) {
        StringBuilder qerry = new StringBuilder();
            
        qerry.append("UPDATE users ");
        qerry.append("SET name = ?, email = ?, password = ? ");
        qerry.append("WHERE id = ?");
        
        try (Connection con = getConnection(); PreparedStatement statement = con.prepareStatement(qerry.toString())) {
            statement.setString(1, user.getName());
            statement.setString(2, user.getEmail());
            statement.setString(3, user.getPassword());
            statement.setInt(4, user.getId());
            
            int rowsAffected = statement.executeUpdate();
            //probably bad decision
            return user;
        } catch (SQLException e) {
            e.printStackTrace();
        }
        
        return null;
    }
    
    @Override
    public boolean delete(Integer id) {
        String sql = "DELETE FROM users WHERE id = ?";

        try (Connection con = getConnection(); PreparedStatement statement = con.prepareStatement(sql)) {
        
            statement.setInt(1, id);
            int rowsAffected = statement.executeUpdate();
            
            return rowsAffected > 0;
            
        } catch (SQLException e) {
            e.printStackTrace();
        }
        
        return false;
    }
    
    @Override
    public boolean create(UserEntity user) {
        String sql = "INSERT INTO users (name, email, password) VALUES(?, ?, ?)";
        
        try (Connection con = getConnection(); PreparedStatement statement = con.prepareStatement(sql)) {
        
            statement.setString(1, user.getName());
            statement.setString(2, user.getEmail());
            statement.setString(3, user.getPassword());
            
            int rowsAffected = statement.executeUpdate();
            
            return rowsAffected > 0;
            
        } catch (SQLException e) {
            e.printStackTrace();
        }
        
        return false;
    }
}