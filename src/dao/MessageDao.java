package dao;

import entity.MessageEntity;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.List;
import java.util.ArrayList

public class MessageDao extends BaseDao<MessageEntity, Integer> {
    @Override 
    public List<MessageEntity> getAll() {
        List<MessageEntity> lst = new ArrayList<>();
        String sql = "SELECT * FROM messages ORDERE BY id";
        
        try (Connection con = getConnection(); PreparedStatement statement = con.prepareStatement(sql)) {
            ResultSet res = statement.executeQuery();
            
            while (res.next()) {
                MessageEntity msg = new MessageEntity();
                
                msg.setId(res.getInt("id"));
                msg.setUserId(res.getInt("user_id"));
                msg.setEventId(res.getInt("event_id"));
                msg.setText(res.getString("text"));
                
                Timestamp timestamp = res.getTimestamp("time");
                msg.setMsgTime(timestamp.toLocalDateTime());
                
                lst.add(msg);
            }
        }
        
        return lst;
    }
    
    @Override
    public MessageEntity getEntityById(Integer id) {
        String sql = "SELECT * FROM messages WHERE id = ?";
        
        try (Connection con = getConnection(); PreparedStatement statement = con.prepareStatement(sql)) {
            statement.setInt(1, id);
            ResultSet res = statement.executeQuery();
            
            MessageEntity msg = new MessageEntity();
                
            msg.setId(res.getInt("id"));
            msg.setUserId(res.getInt("user_id"));
            msg.setEventId(res.getInt("event_id"));
            msg.setText(res.getString("text"));
            
            Timestamp timestamp = res.getTimestamp("time");
            msg.setMsgTime(timestamp.toLocalDateTime());
            
            return msg;
            
        } catch (SQLException e) {
            e.printStackTrace();
        }
        
        return null;
    }
    
    @Override
    public MessageEntity update(MessageEntity newMessage) {
        StringBuilder querry = new StringBuilder();
        
        querry.append("UPDATE messages ");
        querry.append("SET user_id = ?, event_id = ?, text = ?, time = ? ");
        querry.append("WHERE id = ?");
        
        try(Connection con = getConnection(); PreparedStatement statement = con.prepareStatement(querry.toString())) {
            statement.setInt(1, newMessage.getUserId());
            statement.setInt(2, newMessage.getEventId());
            statement.setString(3, newMessage.getText());
            statement.setTimeStamp(4, newMessage.getMsgTime());
            statement.setInt(5, newMessage.getId());

            statement.executeUpdate();
            
            return newMessage;
        } catch (SQLException e) {
            e.printStackTrace();
        }
        
        return null;
    }
    
    @Override
    public boolean delete(Integer id) {
        String sql = "DELETE FROM messages WHERE id = ?";
        
        try (Connection con = getConnection(); PreparedStatement statement = con.prepareStatement(sql)) {
            statement.setInt(1, id);
            int rowsAffected = statement.executeUpdate();
            
            return rowsAffected > 0;
        } catch (SQLException e) {
            e.printStackTrace();
        }
        
        return false
    }
    
    @Override 
    public boolean create(MessageEntity message) {
        String sql = "INSERT INTO messages (user_id, event_id, text, time) VALUES(?, ?, ?, ?)";
        
        try(Connection con = getConnection(); PreparedStatement statement = con.prepareStatement(querry.toString())) {
            statement.setInt(1, newMessage.getUserId());
            statement.setInt(2, newMessage.getEventId());
            statement.setString(3, newMessage.getText());
            statement.setTimeStamp(4, newMessage.getMsgTime());
            statement.setInt(5, newMessage.getId());

            int rowsAffected = statement.executeUpdate();
            
            return rowsAffected > 0;
            
            return newMessage;
            
        } catch (SQLException e) {
            e.printStackTrace();
        }
        
        return false;
    }
}