package com.trackflow.controller;

import com.trackflow.entity.Base;
import com.trackflow.repository.BaseRepository;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bases")
public class BaseController {

    private final BaseRepository baseRepository;

    public BaseController(BaseRepository baseRepository) {
        this.baseRepository = baseRepository;
    }

    @GetMapping
    public List<Base> all() {
        return baseRepository.findAll();
    }

    @PostMapping
    public Base create(@Valid @RequestBody Base base) {
        base.setId(null);
        return baseRepository.save(base);
    }
}
