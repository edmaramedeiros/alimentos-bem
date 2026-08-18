import { router } from 'expo-router';
import { useState } from 'react';
import { Appbar, Menu } from 'react-native-paper';

import { useAuthStore } from '@/store/auth-store';

const NAV_ITEMS: { href: '/' | '/products' | '/customers' | '/sales' | '/commissions'; label: string }[] = [
  { href: '/', label: 'Início' },
  { href: '/products', label: 'Produtos' },
  { href: '/customers', label: 'Clientes' },
  { href: '/sales', label: 'Vendas' },
  { href: '/commissions', label: 'Comissões' },
];

export function AppHeader() {
  const [menuVisible, setMenuVisible] = useState(false);
  const isAdmin = useAuthStore((state) => state.user?.role === 'ADMIN');
  const logout = useAuthStore((state) => state.logout);

  const navigate = (href: string) => {
    setMenuVisible(false);
    router.push(href as never);
  };

  return (
    <Appbar.Header elevated>
      <Appbar.Content title="Edmara Medeiros" onPress={() => navigate('/')} />

      <Menu
        visible={menuVisible}
        onDismiss={() => setMenuVisible(false)}
        anchor={<Appbar.Action icon="menu" onPress={() => setMenuVisible(true)} accessibilityLabel="Menu" />}
      >
        {NAV_ITEMS.map((item) => (
          <Menu.Item key={item.href} title={item.label} onPress={() => navigate(item.href)} />
        ))}
        {isAdmin && <Menu.Item title="Usuários" onPress={() => navigate('/users')} />}
      </Menu>

      <Appbar.Action icon="logout" onPress={logout} accessibilityLabel="Sair" />
    </Appbar.Header>
  );
}
