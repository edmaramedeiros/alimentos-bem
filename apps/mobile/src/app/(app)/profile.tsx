import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Button, Dialog, HelperText, Portal, Text, TextInput } from 'react-native-paper';

import { ApiError } from '@/api/client';
import { changeMyPassword, getMe, updateMe } from '@/api/users';
import { useAuthStore } from '@/store/auth-store';

export default function ProfileScreen() {
  const queryClient = useQueryClient();
  const token = useAuthStore((state) => state.token);
  const setSession = useAuthStore((state) => state.setSession);

  const meQuery = useQuery({ queryKey: ['users', 'me'], queryFn: getMe });

  const [editVisible, setEditVisible] = useState(false);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editSaving, setEditSaving] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  const openEdit = () => {
    if (!meQuery.data) return;
    setEditName(meQuery.data.name);
    setEditEmail(meQuery.data.email);
    setEditError(null);
    setEditVisible(true);
  };

  const submitEdit = async () => {
    if (!editName.trim() || !editEmail.trim()) {
      setEditError('Nome e e-mail são obrigatórios');
      return;
    }
    setEditSaving(true);
    setEditError(null);
    try {
      const updated = await updateMe({ name: editName.trim(), email: editEmail.trim() });
      await queryClient.invalidateQueries({ queryKey: ['users', 'me'] });
      if (token) setSession(token, updated);
      setEditVisible(false);
    } catch (error) {
      setEditError(error instanceof ApiError ? error.message : 'Não foi possível salvar as alterações.');
    } finally {
      setEditSaving(false);
    }
  };

  const [passwordVisible, setPasswordVisible] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const openPasswordDialog = () => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setPasswordError(null);
    setPasswordVisible(true);
  };

  const submitPassword = async () => {
    if (!currentPassword) {
      setPasswordError('Informe a senha atual');
      return;
    }
    if (newPassword.length < 8) {
      setPasswordError('A nova senha deve ter ao menos 8 caracteres');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('As senhas não coincidem');
      return;
    }
    setPasswordSaving(true);
    setPasswordError(null);
    try {
      await changeMyPassword({ currentPassword, newPassword });
      setPasswordVisible(false);
    } catch (error) {
      setPasswordError(error instanceof ApiError ? error.message : 'Não foi possível alterar a senha.');
    } finally {
      setPasswordSaving(false);
    }
  };

  if (meQuery.isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
      </View>
    );
  }

  if (!meQuery.data) {
    return (
      <View style={styles.center}>
        <Text>Não foi possível carregar seu cadastro.</Text>
      </View>
    );
  }

  const me = meQuery.data;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text variant="headlineSmall">Meu perfil</Text>
      <Text variant="bodyMedium" style={styles.muted}>
        {me.name}
      </Text>
      <Text variant="bodyMedium" style={styles.muted}>
        {me.email} · {me.role === 'ADMIN' ? 'Administradora' : 'Vendedora'}
      </Text>
      <Button mode="text" onPress={openEdit} style={styles.editButton}>
        Editar cadastro
      </Button>

      <Text variant="titleMedium" style={styles.sectionTitle}>
        Senha
      </Text>
      <Button mode="outlined" onPress={openPasswordDialog} style={styles.passwordButton}>
        Alterar senha
      </Button>

      <Portal>
        <Dialog visible={editVisible} onDismiss={() => setEditVisible(false)}>
          <Dialog.Title>Editar cadastro</Dialog.Title>
          <Dialog.Content>
            <TextInput label="Nome" mode="outlined" value={editName} onChangeText={setEditName} style={styles.dialogInput} />
            <TextInput
              label="E-mail"
              mode="outlined"
              autoCapitalize="none"
              keyboardType="email-address"
              value={editEmail}
              onChangeText={setEditEmail}
              style={styles.dialogInput}
            />
            <HelperText type="error" visible={!!editError}>
              {editError}
            </HelperText>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setEditVisible(false)} disabled={editSaving}>
              Cancelar
            </Button>
            <Button onPress={submitEdit} loading={editSaving} disabled={editSaving}>
              Salvar
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      <Portal>
        <Dialog visible={passwordVisible} onDismiss={() => setPasswordVisible(false)}>
          <Dialog.Title>Alterar senha</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="Senha atual"
              mode="outlined"
              secureTextEntry
              value={currentPassword}
              onChangeText={setCurrentPassword}
              style={styles.dialogInput}
            />
            <TextInput
              label="Nova senha"
              mode="outlined"
              secureTextEntry
              value={newPassword}
              onChangeText={setNewPassword}
              style={styles.dialogInput}
            />
            <TextInput
              label="Confirmar nova senha"
              mode="outlined"
              secureTextEntry
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              style={styles.dialogInput}
            />
            <HelperText type="error" visible={!!passwordError}>
              {passwordError}
            </HelperText>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setPasswordVisible(false)} disabled={passwordSaving}>
              Cancelar
            </Button>
            <Button onPress={submitPassword} loading={passwordSaving} disabled={passwordSaving}>
              Confirmar
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 24 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  muted: { opacity: 0.7, marginTop: 4 },
  editButton: { marginTop: 12, alignSelf: 'flex-start' },
  sectionTitle: { marginTop: 24, marginBottom: 4 },
  passwordButton: { alignSelf: 'flex-start' },
  dialogInput: { marginTop: 8 },
});
