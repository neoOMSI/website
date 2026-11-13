# Ticket validator events

A vehicle script can respond when a passenger finishes using the ticket validator. Use this event to update a ticket machine, increment a scan counter, or play a confirmation sound. It fires once per completed validator interaction. A passenger walking past the validator or requesting a ticket at the cash desk does not trigger it.

This is a neoOMSI extension. For 0.3.0 release candidates, use a build that includes the passenger validator event.

## Set up the vehicle

Keep the vehicle's `[stamper]` entry in its passenger cabin configuration. It tells the passenger simulation where the validator is. Add these numeric variables to a varlist loaded by the vehicle:

```text
neo_passenger_validator_events
neo_passenger_ticket_sale_active
```

neoOMSI sets `neo_passenger_validator_events` to `1` at vehicle initialization on builds that support this event. Keep its script default at `0`. If your vehicle also supports older builds or OMSI 2, run your existing scan detection only when this flag is zero. This avoids handling the same passenger twice.

## Handle a completed validation

Add a `{trigger:neo_passenger_validated_ticket}` block to a script loaded by the vehicle. This example plays a confirmation sound and requests a visual confirmation only when the cash desk is idle. Declare `validator_show_confirmation` in your varlist, bind `validator_confirm` to a sound in the vehicle sound configuration, and have your display script consume and clear the confirmation flag.

```text
{trigger:neo_passenger_validated_ticket}
    (T.L.validator_confirm)
    (L.L.neo_passenger_ticket_sale_active) !
    {if}
        1 (S.L.validator_show_confirmation)
    {endif}
{end}
```

Read `neo_passenger_ticket_sale_active` inside the trigger. A value of `1` means a passenger is currently requesting a ticket at the driver's cash desk. You can still count the validation while leaving the sale screen visible.

The event carries no ticket type. Use a generic confirmation unless your own script has enough information to identify the fare medium. Vehicles without the trigger keep the usual `ev_Stamper` sound. With the trigger present, the script is responsible for the confirmation sound.

## Check it in game

- Let one passenger validate and check for a single response.
- Serve a cash ticket and check that the request itself produces no validation.
- If your vehicle has separate boarding paths, validate a fare during a cash sale and check that the sale screen stays available.
