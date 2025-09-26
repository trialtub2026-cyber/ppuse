using CrmPortal.Application.Commands.Customers;
using CrmPortal.Application.DTOs;
using CrmPortal.Application.Queries.Customers;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CrmPortal.API.Controllers;

[ApiController]
[Route("api/v1/[controller]")]
[Authorize]
public class CustomersController : ControllerBase
{
    private readonly IMediator _mediator;

    public CustomersController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet]
    public async Task<ActionResult<PagedResult<CustomerDto>>> GetCustomers([FromQuery] CustomerSearchDto searchCriteria)
    {
        var result = await _mediator.Send(new GetCustomersQuery(searchCriteria));
        return Ok(result);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<CustomerDto>> GetCustomer(int id)
    {
        var customer = await _mediator.Send(new GetCustomerByIdQuery(id));
        if (customer == null)
        {
            return NotFound();
        }
        return Ok(customer);
    }

    [HttpPost]
    public async Task<ActionResult<CustomerDto>> CreateCustomer(CreateCustomerCommand command)
    {
        var customer = await _mediator.Send(command);
        return CreatedAtAction(nameof(GetCustomer), new { id = customer.Id }, customer);
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<CustomerDto>> UpdateCustomer(int id, UpdateCustomerCommand command)
    {
        if (id != command.Id)
        {
            return BadRequest("ID mismatch");
        }

        var customer = await _mediator.Send(command);
        return Ok(customer);
    }

    [HttpGet("stats")]
    public async Task<ActionResult<CustomerStatsDto>> GetStats()
    {
        var stats = await _mediator.Send(new GetCustomerStatsQuery(null));
        return Ok(stats);
    }
}