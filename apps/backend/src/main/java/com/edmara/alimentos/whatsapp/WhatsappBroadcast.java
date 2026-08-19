package com.edmara.alimentos.whatsapp;

import com.edmara.alimentos.common.BaseEntity;
import com.edmara.alimentos.user.AppUser;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OrderBy;
import jakarta.persistence.Table;
import java.util.ArrayList;
import java.util.List;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

@Entity
@Table(name = "whatsapp_broadcast")
public class WhatsappBroadcast extends BaseEntity {

    @Column(nullable = false, columnDefinition = "text")
    private String message;

    @JdbcTypeCode(SqlTypes.VARBINARY)
    @Column(name = "attachment_data")
    private byte[] attachmentData;

    @Column(name = "attachment_file_name")
    private String attachmentFileName;

    @Column(name = "attachment_mime_type")
    private String attachmentMimeType;

    @Column(name = "city_filter")
    private String cityFilter;

    @Column(name = "name_filter")
    private String nameFilter;

    @Column(name = "delay_seconds", nullable = false)
    private int delaySeconds = 5;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private BroadcastStatus status = BroadcastStatus.QUEUED;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "created_by", nullable = false)
    private AppUser createdBy;

    @OneToMany(mappedBy = "broadcast", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @OrderBy("createdAt asc")
    private List<WhatsappBroadcastRecipient> recipients = new ArrayList<>();

    protected WhatsappBroadcast() {
        // JPA
    }

    public WhatsappBroadcast(String message, AppUser createdBy) {
        this.message = message;
        this.createdBy = createdBy;
        this.status = BroadcastStatus.QUEUED;
    }

    public void addRecipient(WhatsappBroadcastRecipient recipient) {
        recipients.add(recipient);
        recipient.setBroadcast(this);
    }

    public String getMessage() {
        return message;
    }

    public byte[] getAttachmentData() {
        return attachmentData;
    }

    public void setAttachmentData(byte[] attachmentData) {
        this.attachmentData = attachmentData;
    }

    public String getAttachmentFileName() {
        return attachmentFileName;
    }

    public void setAttachmentFileName(String attachmentFileName) {
        this.attachmentFileName = attachmentFileName;
    }

    public String getAttachmentMimeType() {
        return attachmentMimeType;
    }

    public void setAttachmentMimeType(String attachmentMimeType) {
        this.attachmentMimeType = attachmentMimeType;
    }

    public String getCityFilter() {
        return cityFilter;
    }

    public void setCityFilter(String cityFilter) {
        this.cityFilter = cityFilter;
    }

    public String getNameFilter() {
        return nameFilter;
    }

    public void setNameFilter(String nameFilter) {
        this.nameFilter = nameFilter;
    }

    public int getDelaySeconds() {
        return delaySeconds;
    }

    public void setDelaySeconds(int delaySeconds) {
        this.delaySeconds = delaySeconds;
    }

    public BroadcastStatus getStatus() {
        return status;
    }

    public void setStatus(BroadcastStatus status) {
        this.status = status;
    }

    public AppUser getCreatedBy() {
        return createdBy;
    }

    public List<WhatsappBroadcastRecipient> getRecipients() {
        return recipients;
    }
}
