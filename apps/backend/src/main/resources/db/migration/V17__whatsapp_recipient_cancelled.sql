-- Permite remover um destinatário da fila de uma campanha (status CANCELLED),
-- em vez de deixar só avançar pra SENT/FAILED.
ALTER TABLE whatsapp_broadcast_recipient DROP CONSTRAINT whatsapp_broadcast_recipient_status_check;
ALTER TABLE whatsapp_broadcast_recipient ADD CONSTRAINT whatsapp_broadcast_recipient_status_check
    CHECK (status IN ('QUEUED', 'SENT', 'FAILED', 'CANCELLED'));
