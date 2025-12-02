using Hangfire.Dashboard;

namespace Certus.Api.Configuration;

/// <summary>
/// Authorization filter for Hangfire dashboard in production
/// Requires SystemAdmin role to access the dashboard
/// </summary>
public class HangfireAuthorizationFilter : IDashboardAuthorizationFilter
{
    public bool Authorize(DashboardContext context)
    {
        var httpContext = context.GetHttpContext();

        // Allow access if user is authenticated and has SystemAdmin role
        return httpContext.User.Identity?.IsAuthenticated == true &&
               httpContext.User.IsInRole("SystemAdmin");
    }
}
