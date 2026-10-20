-- Permite pausar uma campanha (status PAUSED) e depois retomar o envio pendente.
ALTER TABLE whatsapp_broadcast DROP CONSTRAINT whatsapp_broadcast_status_check;
ALTER TABLE whatsapp_broadcast ADD CONSTRAINT whatsapp_broadcast_status_check
    CHECK (status IN ('QUEUED', 'SENDING', 'PAUSED', 'DONE', 'FAILED'));
