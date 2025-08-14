package com.project.gradegoal.Entity;

import jakarta.persistence.*;

@Entity
@Table(name = "users")
public class gradeGoal {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable=false, unique = true, length = 128)
    private String uid;

    @Column(nullable=false, unique = true, length = 255)
    private String email;

    @Column(length = 255)
    private String displayName;

    public gradeGoal() {}

    public gradeGoal(String uid, String email, String displayName) {
        this.uid = uid;
        this.email = email;
        this.displayName = displayName;
    }

    public Long getId() { return id; }
    public String getUid() { return uid; }
    public void setUid(String uid) { this.uid = uid; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getDisplayName() { return displayName; }
    public void setDisplayName(String displayName) { this.displayName = displayName; }
}