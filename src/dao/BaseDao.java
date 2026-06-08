package dao;

import java.sql.*;
import javax.naming.*;
import javax.sql.DataSource;

// k - is a primary key
public abstract class BaseDao <E, K> {
    private DataSource dataSource;
    
    public BaseDao() {
        try {
            Context context = new InitialContext();
            dataSource = (DataSource) context.lookup("java:comp/env/jdbc/postgres")
        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("Failed to loookup DataSource", e);
        }
    }
    
    protected Connection getConnection() throws SQLException {
        return dataSource.getConnection();
    }
    
    
    public abstract List<E> getAll();
    public abstract E getEntityById(K id);
    public abstract E update(E entity);
    public abstract boolean delete(K id)
    public abstract boolean create(E entity);
}