package com.example.analysis.controller;

import com.example.analysis.dto.CashflowRequest;
import com.example.analysis.dto.CashflowResponse;
import com.example.analysis.service.CashflowService;
import org.springframework.web.bind.annotation.*;

/**
 * REST controller for cashflow analysis endpoints.
 * Handles HTTP requests for property investment cashflow calculations.
 */
@RestController
@RequestMapping("/api/analysis")
public class CashflowController {

  private final CashflowService cashflowService = new CashflowService();

  /**
   * Analyzes cashflow for a property investment.
   * Accepts property and financial parameters and returns calculated metrics.
   * 
   * @param request The cashflow request containing property and financial data
   * @return CashflowResponse with summary metrics and yearly projections
   */
  @PostMapping("/cashflow")
  public CashflowResponse analyze(@RequestBody CashflowRequest request) {
    return cashflowService.analyze(request);
  }
}
