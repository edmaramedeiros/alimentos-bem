package com.edmara.alimentos.user;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

/**
 * Cria um usuário ADMIN inicial quando app.seed-admin.enabled=true e ainda não existe
 * nenhum usuário com o e-mail configurado. Habilitado por padrão só no profile "dev".
 */
@Component
public class DevAdminSeeder implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DevAdminSeeder.class);

    private final AppUserRepository appUserRepository;
    private final PasswordEncoder passwordEncoder;
    private final boolean enabled;
    private final String name;
    private final String email;
    private final String password;

    public DevAdminSeeder(
        AppUserRepository appUserRepository,
        PasswordEncoder passwordEncoder,
        @Value("${app.seed-admin.enabled}") boolean enabled,
        @Value("${app.seed-admin.name}") String name,
        @Value("${app.seed-admin.email}") String email,
        @Value("${app.seed-admin.password}") String password
    ) {
        this.appUserRepository = appUserRepository;
        this.passwordEncoder = passwordEncoder;
        this.enabled = enabled;
        this.name = name;
        this.email = email;
        this.password = password;
    }

    @Override
    public void run(String... args) {
        if (!enabled) {
            return;
        }
        if (appUserRepository.existsByEmail(email)) {
            return;
        }
        AppUser admin = new AppUser(name, email, passwordEncoder.encode(password), Role.ADMIN, null);
        appUserRepository.save(admin);
        log.info("Usuário ADMIN inicial criado: {}", email);
    }
}
