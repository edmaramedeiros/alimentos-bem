package com.edmara.alimentos.customer;

import com.edmara.alimentos.common.ResourceNotFoundException;
import com.edmara.alimentos.customer.dto.CreateCustomerRequest;
import com.edmara.alimentos.customer.dto.CustomerResponse;
import com.edmara.alimentos.customer.dto.UpdateCustomerRequest;
import com.edmara.alimentos.user.AppUser;
import com.edmara.alimentos.user.Role;
import java.util.List;
import java.util.UUID;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

@Service
public class CustomerService {

    private final CustomerRepository customerRepository;

    public CustomerService(CustomerRepository customerRepository) {
        this.customerRepository = customerRepository;
    }

    @Transactional(readOnly = true)
    public List<CustomerResponse> list(AppUser currentUser, String query) {
        boolean hasQuery = StringUtils.hasText(query);
        List<Customer> customers;

        if (currentUser.getRole() == Role.ADMIN) {
            customers = hasQuery
                ? customerRepository.findByNameContainingIgnoreCase(query)
                : customerRepository.findAll();
        } else {
            customers = hasQuery
                ? customerRepository.findByOwnerVendedor_IdAndNameContainingIgnoreCase(currentUser.getId(), query)
                : customerRepository.findByOwnerVendedor_Id(currentUser.getId());
        }

        return customers.stream().map(CustomerResponse::from).toList();
    }

    @Transactional(readOnly = true)
    public CustomerResponse getById(UUID id, AppUser currentUser) {
        Customer customer = findCustomer(id);
        assertOwnership(customer, currentUser);
        return CustomerResponse.from(customer);
    }

    @Transactional
    public CustomerResponse create(CreateCustomerRequest request, AppUser currentUser) {
        Customer customer = new Customer(request.name(), currentUser);
        applyFields(customer, request.phone(), request.email(), request.addressLine(), request.city(),
            request.state(), request.zip(), request.notes(), request.grupo(), request.whatsappOptIn());
        return CustomerResponse.from(customerRepository.save(customer));
    }

    @Transactional
    public CustomerResponse update(UUID id, UpdateCustomerRequest request, AppUser currentUser) {
        Customer customer = findCustomer(id);
        assertOwnership(customer, currentUser);

        customer.setName(request.name());
        applyFields(customer, request.phone(), request.email(), request.addressLine(), request.city(),
            request.state(), request.zip(), request.notes(), request.grupo(), request.whatsappOptIn());
        customer.setActive(request.active());

        return CustomerResponse.from(customer);
    }

    private void applyFields(
        Customer customer,
        String phone,
        String email,
        String addressLine,
        String city,
        String state,
        String zip,
        String notes,
        String grupo,
        boolean whatsappOptIn
    ) {
        customer.setPhone(phone);
        customer.setEmail(email);
        customer.setAddressLine(addressLine);
        customer.setCity(city);
        customer.setState(state);
        customer.setZip(zip);
        customer.setNotes(notes);
        customer.setGrupo(grupo);
        customer.setWhatsappOptIn(whatsappOptIn);
    }

    private void assertOwnership(Customer customer, AppUser currentUser) {
        boolean isOwner = customer.getOwnerVendedor().getId().equals(currentUser.getId());
        if (currentUser.getRole() != Role.ADMIN && !isOwner) {
            throw new AccessDeniedException("Você não tem permissão para acessar este cliente");
        }
    }

    private Customer findCustomer(UUID id) {
        return customerRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Cliente não encontrado: " + id));
    }
}
