package com.example.analysis.controller;

import com.example.analysis.dto.CashflowRequest;
import com.example.analysis.dto.CashflowResponse;
import com.example.analysis.service.CashflowService;
import org.springframework.web.bind.annotation.*;

/**
 * REST controller exposing the cashflow analysis endpoint.
 * POST /api/analysis/cashflow  ->  returns summary KPIs and yearly projection.
 */
@RestController
@RequestMapping("/api/analysis")
public class CashflowController {

  private final CashflowService svc = new CashflowService();

  @PostMapping("/cashflow")
  public CashflowResponse analyze(@RequestBody CashflowRequest req){
    return svc.analyze(req);
  }
}
