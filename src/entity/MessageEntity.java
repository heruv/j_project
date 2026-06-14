package entity;

import java.time.LocalDateTime;

public class MessageEntity {
    private int id;
    private int userId;
    private int eventId;
    private String text;
    private LocalDateTime msgTime;
    
    public MessageEntity() {};
    
    public int getId() { return id; }
    public void setId(int id) { this.id = id; }
    
    public int getUserId() { return userId; }
    public void setUserId(int user_id) { this.userId = userId; }
    
    public int getEventId() { return eventId; }
    public void setEventId(int event_id) { this.eventId = eventId; }
    
    public String getText() { return text; }
    public void setText(String text) { this.text = text; }
    
    public LocalDateTime getMsgTime() { return msgTime; }
    public void setMsgTime(LocalDateTime time) { this.msgTime = time;}  
    
}