import { router, usePathname } from 'expo-router';
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

const LIST_ROUTES = new Set(['/', '/products', '/customers', '/sales', '/commissions', '/users', '/whatsapp']);

/** Para /products/123 ou /products/new, devolve a tela de listagem "/products". */
function listRouteFor(pathname: string): string {
  const firstSegment = pathname.split('/').filter(Boolean)[0];
  return firstSegment ? `/${firstSegment}` : '/';
}

export function AppHeader() {
  const [menuVisible, setMenuVisible] = useState(false);
  const isAdmin = useAuthStore((state) => state.user?.role === 'ADMIN');
  const logout = useAuthStore((state) => state.logout);
  const pathname = usePathname();
  const showBackButton = !LIST_ROUTES.has(pathname);

  const navigate = (href: string) => {
    setMenuVisible(false);
    router.push(href as never);
  };

  const goBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace(listRouteFor(pathname) as never);
    }
  };

  return (
    <Appbar.Header elevated>
      {showBackButton && <Appbar.BackAction onPress={goBack} accessibilityLabel="Voltar" />}
      <Appbar.Content title="Edmara Medeiros - Alimentos do Bem" onPress={() => navigate('/')} />

      <Menu
        visible={menuVisible}
        onDismiss={() => setMenuVisible(false)}
        anchor={<Appbar.Action icon="menu" onPress={() => setMenuVisible(true)} accessibilityLabel="Menu" />}
      >
        {NAV_ITEMS.map((item) => (
          <Menu.Item key={item.href} title={item.label} onPress={() => navigate(item.href)} />
        ))}
        {isAdmin && <Menu.Item title="Usuários" onPress={() => navigate('/users')} />}
        {isAdmin && <Menu.Item title="WhatsApp" onPress={() => navigate('/whatsapp')} />}
      </Menu>

      <Appbar.Action icon="logout" onPress={logout} accessibilityLabel="Sair" />
    </Appbar.Header>
  );
}
