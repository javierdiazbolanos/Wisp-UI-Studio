export interface WispTemplate {
  id: string;
  title: string;
  category: "Wizard" | "Dashboard" | "Form" | "Mobile" | "E-Commerce" | "Split View" | "Design System";
  description: string;
  code: string;
}

export const WISP_TEMPLATES: WispTemplate[] = [
  {
    id: "m3-expressive-gallery",
    title: "Material 3 Expressive UI • Master Design System",
    category: "Design System",
    description: "Exhaustive showcase of every Material 3 Expressive component: Split Button, Button Group, FAB Speed-Dial Menu, Wavy Progress, Navigation Rail, Drawers, Sheets, Typed Tables, Inputs, and Surfaces.",
    code: `@theme material3

@M3Gallery:screen
  appbar "Material 3 Expressive Master Gallery" icon=palette
    button icon=bell text badge="5" snackbar="5 design system updates available"
    button icon=share-2 text snackbar="Gallery share link copied"
    button "Export Specs" tonal icon=download goto=@M3DialogPreview

  breadcrumbs items=["Design System", "Material 3 Expressive", "Master Component Catalog"] separator=chevron

  snackbar "Material 3 Expressive baseline loaded with 100% token coverage" action="Specs" icon=sparkles type=info goto=@M3DialogPreview

  row spacing=16 justify=between align=center
    column spacing=4
      text "Google Material Design 3 Expressive Master Catalog" display color=primary
      text "Comprehensive visual and interactive specification: Split Buttons, Connected Groups, Speed-Dial FABs, Wavy Indicators, Typed Tables, and Spring Motion."
    row spacing=12
      button "Open Modal Dialog" filled icon=layers goto=@M3DialogPreview
      button "View Side Sheet" tonal icon=sidebar goto=@M3SideSheetPreview
      button "Bottom Sheet" outlined icon=arrow-up-right goto=@M3SheetPreview

  spacer height=8

  grid cols=4 gap=16
    metric label="M3 Tokens" value="48 Tokens" delta="100% HCT Coverage" icon=palette
    metric label="Widgets & Specs" value="42 Components" delta="Baseline + Expressive" icon=box
    metric label="Accessibility" value="WCAG AAA" delta="4.5:1 Contrast Ratio" icon=shield-check
    metric label="Architecture" value="TSX + WDSL" delta="Production Ready" icon=code

  spacer height=12

  tabs items=["Actions & M3E Buttons", "Inputs & Forms", "Wavy Progress & Feedback", "Structure & Typed Tables", "Surfaces & Navigation"]
    tab "Actions & M3E Buttons"
      split
        left
          card elevated
            text "Material 3 Expressive: Split Buttons & Button Groups" title
            text "Conjoined multi-action controls that combine a primary trigger with contextual dropdowns or unified segmented units." body
            spacer height=8
            text "Split Button (Primary Action + Submenu):" label
            row spacing=12
              splitbutton "Publish Release" icon=send filled goto=@M3DialogPreview
                menuitem "Save as draft" icon=save shortcut="Ctrl+S"
                menuitem "Schedule publication" icon=clock
                menuitem "Export as JSON" icon=download
              splitbutton "Export Data" icon=download tonal
                menuitem "Download PDF Report" icon=file-text
                menuitem "Export CSV Table" icon=table
                menuitem "Copy to Clipboard" icon=copy
            spacer height=12
            text "Connected Button Group (Unified Segmented Borders):" label
            buttongroup outlined
              button "Daily" active=true
              button "Weekly"
              button "Monthly"
              button "Quarterly"
            spacer height=12
            text "Standard Button Hierarchy:" label
            row spacing=10
              button "Filled" filled icon=check badge="New"
              button "Tonal" tonal icon=sparkles
              button "Outlined" outlined icon=edit-3
              button "Elevated" elevated icon=arrow-up
              button "Text" text icon=chevron-right
            spacer height=12
            text "Interactive Icon Buttons with Tooltips:" label
            row spacing=12
              iconbutton icon=heart variant=filled tooltip="Favorite item"
              iconbutton icon=bookmark variant=tonal tooltip="Bookmark for later"
              iconbutton icon=share-2 variant=outlined tooltip="Share with team"
              iconbutton icon=more-vertical variant=standard tooltip="More options"

        right
          card elevated
            text "Speed-Dial FAB Menu & Segmented Controls" title
            text "High-emphasis floating action speed-dial menu and discrete filter controls:" body
            spacer height=8
            text "M3 Expressive FAB Menu (Floating Speed Dial):" label
            row spacing=16 align=center
              fabmenu "Quick Actions" icon=plus variant=primary
                fabitem "Create Event" icon=calendar goto=@M3DialogPreview
                fabitem "New Contact" icon=user-plus snackbar="Contact dialog opened"
                fabitem "Upload Assets" icon=upload snackbar="Asset uploaded"
                fabitem "Share Catalog" icon=share-2 snackbar="Share link copied"
              text "Click '+' to toggle the animated speed-dial stack." body color=muted
            spacer height=12
            text "Segmented Button & Categorical Chips:" label
            segmentedbutton device options=["Desktop", "Tablet", "Mobile"] selected="Desktop"
            spacer height=10
            row spacing=8
              chip "Active Filter" variant=filter selected=true icon=check
              chip "Assist Suggestion" icon=help-circle
              chip "High Priority" icon=alert-circle selected=true
              chip "Cloud Native" icon=cloud
            spacer height=12
            text "Contextual Dropdown Menu:" label
            row spacing=12 align=center
              menu "Manage Resource" icon=more-vertical
                menuitem "Edit Profile" icon=edit shortcut="Ctrl+E"
                menuitem "Duplicate Configuration" icon=copy shortcut="Ctrl+D"
                menuitem "Delete Resource" icon=trash goto=@M3DialogPreview
              button "Trigger Snackbar" filled icon=send snackbar="Synced successfully" snackbar-action="Undo" snackbar-type=success

    tab "Inputs & Forms"
      split
        left
          card elevated
            text "Text Fields, Search & Large Inputs" title
            textfield username label="Username" placeholder="alex.morgan" icon=user required=true helper="Enter your unique handle"
            textfield email label="Work Email" placeholder="alex@company.com" icon=mail required=true
            textfield password label="Secure Password" placeholder="••••••••••••" icon=lock type=password
            searchbar query placeholder="Search components, tokens, or guidelines..."
            textarea bio label="Professional Bio" rows=3 placeholder="Write a short summary about your background and expertise..."

        right
          card elevated
            text "Pickers, Selectors, Sliders & Precision Controls" title
            grid cols=2 gap=12
              select role label="System Role" value="Tech Lead"
                option "Tech Lead"
                option "Senior Frontend Engineer"
                option "Principal Product Designer"
                option "Fullstack Architect"
              datepicker startDate label="Start Date" value="2026-08-20"
            autocomplete country label="Country / Region" placeholder="Type to filter..."
              option "United States"
              option "Canada"
              option "Colombia"
              option "Germany"
              option "Japan"
              option "United Kingdom"
              option "Venezuela"
              option "Australia"
            timepicker syncTime label="Sync Schedule" value="18:30"
            spacer height=4
            slider experience label="Years of Experience" min=1 max=20 value=8
            text "Rate your satisfaction with Wisp DSL:" label
            rating csatScore label="CSAT Score" value=5 max=5
            row spacing=16
              radio tier1 label="Standard Plan" group="billingTier" checked=true
              radio tier2 label="Enterprise Plan" group="billingTier"
            row spacing=16
              switch darkMode label="Dark Theme Active" checked=false
              checkbox terms label="I agree to M3 Terms of Service" checked=true

    tab "Wavy Progress & Feedback"
      grid cols=2 gap=16
        card elevated
          text "Material 3 Expressive: Wavy Progress Indicators" title
          text "Google's organic harmonic sine wave tracks and multi-petal circular rosette oscillators:" body
          spacer height=8
          text "Linear Sinusoidal Harmonic Wave (84%):" label
          wavyprogress value=84 message="Harmonizing M3 expressive tokens (84%)" variant=linear
          spacer height=8
          text "Circular Rosette Petal Oscillator (92%):" label
          wavyprogress variant=circular value=92 message="Rosette Multi-Petal Sync (92%)"
          spacer height=8
          text "Continuous Harmonic Wave (Indeterminate):" label
          wavyprogress color=tertiary size=lg message="Real-time event streaming active..."
          spacer height=12
          text "Standard Linear & Circular Indicators:" label
          linearprogress value=75 message="Compiling AST nodes (75%)"
          spacer height=6
          grid cols=2 gap=12
            circularprogress value=85 message="Health (85%)"
            circularprogress value=100 message="Optimized (100%)"

        card outlined
          text "Feedback Alerts, Rich Tooltips & Spinners" title
          alert "Cloud database synchronization completed successfully with zero schema conflicts." type=success title="Operation Successful"
          alert "Review and verify TLS certificates prior to staging deployment." type=warning title="Security Notice"
          alert "Failed to reach fallback microservices cluster in region us-east4." type=error title="Connection Timeout"
          alert "Material 3 Expressive dynamically harmonizes secondary and tertiary hues." type=info title="Design System Note"
          spacer height=8
          richtooltip title="Material 3 Expressive Guide" text="Learn how HCT color space and dynamic tonal curves elevate your interfaces." action="View Documentation" action_goto=@M3DialogPreview
          spacer height=8
          loading "Synchronizing design system tokens with cloud backend..."

    tab "Structure & Typed Tables"
      card elevated
        row spacing=16 justify=between
          column spacing=2
            text "Typed Data Table with Real-Time Filtering & Custom Formats" title
            text "Supports custom column formatters: avatars, status pills, progress tracks, dates, currency, ratings, and row actions." body
          button "New Member" filled icon=plus
        table title="Engineering Team Directory" columns=["Member:avatar", "Email:text", "Role:status", "Progress:progress", "Rating:rating", "Last Active:date", "Salary:currency", "Action:action", "Options:dropdown"] striped=true searchable=true pageSize=5
          row ["Alex Morgan", "alex@google.com", "Super Admin", "95%", "5", "2026-08-20", "$14,500.00", "Manage", ""]
          row ["Elena Rostova", "elena@company.com", "DevOps Lead", "88%", "5", "2026-08-19", "$12,800.00", "Manage", ""]
          row ["Carlos Mendez", "carlos@company.com", "QA Architect", "72%", "4", "2026-08-18", "$11,200.00", "Manage", ""]
          row ["Sofia Castro", "sofia@company.com", "Product Designer", "100%", "5", "2026-08-20", "$13,400.00", "Manage", ""]
          row ["Javier Díaz Bolaños", "javier@goldeneventos.com", "Principal Architect", "98%", "5", "2026-08-22", "$16,500.00", "Manage", ""]
        divider
        text "Structured Master List Items with Integrated Controls:" label
        list
          listitem "Master Design Tokens" subtitle="Synchronized with @material/material-color-utilities" icon=palette badge="v3.2" switch=true
          listitem "Zero-Trust Security Policies" subtitle="Enforcing mTLS and identity certificates" icon=shield-check badge="Active" checkbox=true
          listitem "Speed-Dial Action Listeners" subtitle="Triggering contextual micro-interactions" icon=zap badge="Expressive"

    tab "Surfaces & Navigation"
      split
        left
          navigationrail title="Studio" fab=plus
            navitem "Overview" icon=home active
            navitem "Analytics" icon=bar-chart-2 badge="8"
            navitem "Messages" icon=inbox badge="5"
            navitem "Settings" icon=settings
        right
          column spacing=16
            card elevated
              text "Interactive Card Carousel" title
              text "Horizontal sliding deck with smooth snap scrolling and edge padding:" body
              spacer height=6
              carousel
                card outlined
                  text "Grand Emerald Ballroom" title
                  text "Capacity for 350 guests with high-fidelity acoustics and ambient stage lighting." body
                card outlined
                  text "Botanical Terrace Garden" title
                  text "Open-air scenic lounge with panoramic skyline views and lush landscape architecture." body
                card outlined
                  text "Executive Innovation Auditorium" title
                  text "Equipped with ultra-wide 4K projection and enterprise videoconferencing suites." body
            card outlined
              text "Collapsible Accordions & Settings" title
              accordion "1. Infrastructure & Deployment Parameters" expanded=true icon=server
                text "Configure Kubernetes cluster topologies, load balancers, and ingress routers." body
                row spacing=12
                  switch autoScale label="HPA Autoscaling" checked=true
                  switch ddosProtect label="Cloud Armor DDoS Defense" checked=true
              accordion "2. Zero-Trust Access & Identity Verification" expanded=false icon=shield-check
                text "Context-aware authentication, granular RBAC policies, and real-time audit logging." body
              accordion "3. Performance Profiling & Metrics" expanded=false icon=activity
                text "Continuous tracing with OpenTelemetry and automated regression benchmarks." body
            row spacing=12
              button "Open Navigation Drawer" filled icon=menu goto=@M3DrawerPreview
              button "Open Side Sheet" tonal icon=sidebar goto=@M3SideSheetPreview
              button "Full Rail Workspace" outlined icon=compass goto=@RailWorkspace

  fab "Create Widget" icon=plus extended=true goto=@M3DialogPreview

@RailWorkspace:screen
  navigationrail title="Workspace" subtitle="v2.4 Pro" fab=plus fabLabel="Create" fabGoto=@M3DialogPreview user="Carlos Dev" role="Lead Architect"
    railitem "Overview" icon=home active
      appbar "Dashboard Overview" icon=layout variant=medium
        button icon=bell text badge="3" snackbar="3 new notifications"
        button icon=share-2 text snackbar="Workspace link copied"
        button "New Project" filled icon=plus goto=@M3DialogPreview
      grid cols=3 gap=16
        metric label="Active Projects" value="24" delta="+3 this week" icon=folder
        metric label="API Latency" value="18ms" delta="Optimal" icon=zap
        metric label="Sprint Velocity" value="94.2%" delta="+5.1%" icon=trending-up
      card elevated
        text "Team Performance & Deliverables" title
        text "Real-time monitoring synchronized with Material 3 Jetpack Compose and Flutter pipelines." body
        spacer height=8
        linearprogress value=82 message="Sprint 42 Completed (82%)"
      grid cols=2 gap=12
        card outlined
          text "Recent Activity" title
          list
            listitem "Jetpack Compose M3 Exporter" subtitle="Elevation tokens updated" icon=code
            listitem "Flutter 3.24 Theme Bridge" subtitle="Tonal palettes harmonized" icon=sparkles
        card outlined
          text "Quick Actions" title
          column spacing=10
            button "Open M3 Dialog" filled icon=external-link goto=@M3DialogPreview
            button "View Navigation Drawer" tonal icon=menu goto=@M3DrawerPreview
            button "Explore Full Gallery" outlined icon=arrow-left goto=@M3Gallery

    railitem "Analytics" icon=bar-chart-2 badge="8"
      appbar "Growth Metrics & Analytics" icon=bar-chart-2 variant=large
        button icon=download text snackbar="Report downloaded as CSV"
        button icon=filter text snackbar="Filters applied"
      grid cols=2 gap=16
        card elevated
          text "Weekly Active Users" title
          text "Session time distribution across Android, iOS, and Web clients." body
          spacer height=8
          linearprogress value=68 message="Target: 100,000 MAU (68%)"
        card elevated
          text "Conversion Funnel" title
          text "Record completion rate reached with Material 3 Expressive components." body
          spacer height=8
          circularprogress value=92 message="Retention (92%)"
      card elevated
        text "System Health & Servers" title
        grid cols=3 gap=12
          stat label="CPU Usage" value="23%" icon=cpu
          stat label="RAM Memory" value="4.2 GB" icon=database
          stat label="Availability" value="99.99%" icon=shield-check

    railitem "Messages" icon=inbox badge="5"
      appbar "Team Inbox" icon=mail variant=center
        button icon=search text
        button icon=more-vertical text
      card elevated
        text "Recent Messages & Notifications" title
        list
          listitem "Carlos Díaz" subtitle="Reviewing NavigationRail expandable support" icon=user badge="New"
          listitem "CI/CD System" subtitle="Android and Flutter artifact builds passed" icon=check-circle badge="Verified"
          listitem "Design Systems Team" subtitle="New HCT palettes exported to token JSON" icon=sparkles badge="Tokens"
      row spacing=12
        button "Compose Message" filled icon=edit goto=@M3DialogPreview
        button "Mark All Read" tonal icon=check snackbar="All messages marked as read"

    railitem "Settings" icon=settings
      appbar "System & Environment Preferences" icon=settings variant=small
        button "Save Changes" filled icon=save snackbar="Settings saved successfully"
      card elevated
        text "Build & Rendering Configuration" title
        column spacing=14
          switch autoExport label="Auto-compile Jetpack Compose on code change" checked=true
          switch syncTheme label="Synchronize dynamic HCT tokens with OS" checked=true
          switch notifications label="Desktop system notifications" checked=false
          slider cacheSize label="Cache memory allocation (MB)" min=128 max=2048 value=512
        divider
        row spacing=12
          button "Reset Defaults" outlined icon=rotate-ccw snackbar="Default settings restored"
          button "Return to M3 Gallery" filled icon=arrow-left goto=@M3Gallery

@M3DrawerPreview:drawer
  drawer title="Wisp UI Studio" subtitle="developer@wisp.dev"
    draweritem "Dashboard Hub" icon=layout active
    draweritem "Venues & Spaces" icon=calendar badge="12"
    draweritem "Budget & Invoices" icon=dollar-sign
    section "Preferences & System"
    draweritem "Theme Settings" icon=settings
    draweritem "Close Drawer" icon=x goto=close

@M3SideSheetPreview:sidesheet
  sidesheet title="Advanced Search Filters"
    text "Adjust real-time criteria to refine the component catalog." body
    select category label="Event Category" options=["Weddings", "Corporate Galas", "Conferences", "Graduations"]
    slider budget label="Maximum Budget ($ USD)" min=1000 max=80000 value=25000
    switch availableOnly label="Show available dates only" checked=true
    row spacing=12 justify=end
      button "Close" text goto=close
      button "Apply Filters" filled goto=close

@M3DialogPreview:dialog
  card elevated
    text "Confirm System Changes" headline color=primary
    text "Are you sure you want to apply these design system tokens across all connected screens?" body
    spacer height=12
    alert "This action will publish a new release artifact to your linked GitHub repository." type=info
    spacer height=12
    row spacing=12 justify=end
      button "Cancel" text goto=close
      button "Confirm & Publish" filled icon=rocket goto=close

@M3SheetPreview:sheet
  card elevated
    row spacing=12 justify=between
      text "Contextual Bottom Sheet" headline color=primary
      button "" text icon=x goto=close
    text "Secondary contextual details and actions presented without losing main screen state." body
    spacer height=12
    list
      listitem "Share via Secure Link" icon=share-2
      listitem "Export PDF Specifications" icon=file-text
      listitem "Download Jetpack Theme" icon=download
    spacer height=16
    row spacing=12 justify=end
      button "Dismiss Sheet" filled goto=close
`,
  },
  {
    id: "kiro-setup-wizard",
    title: "Kiro Cloud Setup Wizard (Official Spec)",
    category: "Wizard",
    description: "Step-by-step multi-screen onboarding flow with split layout, credential inputs, and animated step navigation.",
    code: `@theme material3

@KiroSetup:wizard
  steps: 3

  step "Welcome"
    column spacing=24
      card elevated
        text "Configure Your Kiro Cloud Workspace" headline color=primary
        text "Wisp enables you to prototype complete interactive flows declaratively. Validate your parameters now to accelerate downstream engineering."
        spacer height=12
        row spacing=12
          chip "Cloud Native" icon=cloud selected=true
          chip "High Availability" icon=shield selected=true
          chip "M3 Expressive" icon=palette
        spacer height=16
        button "Start Configuration" filled icon=arrow-right goto=@KiroSetup(step=2)

  step "Connection & Credentials"
    split
      left
        card filled
          text "Connection Guide" title
          text "Provide your cluster endpoints to securely bind the data gateway."
          spacer height=8
          listitem "1. API Endpoint" subtitle="Public HTTPS Gateway URL" icon=globe
          listitem "2. Authentication" subtitle="Bearer Security Token" icon=key
          listitem "3. Timeout" subtitle="Max connection timeout in ms" icon=clock

      right
        card elevated
          text "Service Credentials" title color=primary
          textfield endpoint label="Service Gateway URL" placeholder="https://api.yourcompany.com/v1" icon=globe
          textfield token label="Access Token" placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." icon=lock type=password
          row spacing=16
            textfield timeout label="Timeout (ms)" placeholder="5000" type=number
            select region label="Cloud Region" options=["us-central1 (Iowa)", "southamerica-east1 (São Paulo)", "europe-west1 (Belgium)"]
          switch ssl label="Enforce TLS 1.3 Encryption" checked=true
          spacer height=12
          row spacing=12 justify=between
            button "Back" text icon=arrow-left goto=@KiroSetup(step=1)
            button "Validate & Proceed" filled icon=check goto=@KiroSetup(step=3)

  step "Completed"
    card elevated
      text "Workspace Configured Successfully!" headline color=primary
      text "The connection with your upstream microservices has been verified. Your environment is ready for production."
      spacer height=16
      alert "All credentials were encrypted and authenticated against the server cluster." type=success title="Production Ready"
      spacer height=16
      row spacing=12
        button "Go to Main Dashboard" filled icon=home goto=@Home
        button "Review Settings" outlined icon=settings goto=@KiroSetup(step=2)

@Home:screen
  card elevated
    row spacing=16 justify=between
      column spacing=4
        text "Welcome to Kiro Console" headline
        text "Real-time overview of active cloud clusters and services"
      avatar name="Alex Morgan" size=lg
    divider
    grid cols=3 gap=16
      metric label="Active Services" value="12/12" delta="+100% Operational" icon=check-circle
      metric label="Requests / sec" value="4,820 req/s" delta="+14.2%" icon=trending-up
      metric label="Average Latency" value="38 ms" delta="-12 ms vs target" icon=zap
    spacer height=16
    row spacing=12
      button "Configure New Cluster" filled icon=plus goto=@KiroSetup
      button "Audit Logs" tonal icon=file-text
`,
  },
  {
    id: "saas-analytics-dashboard",
    title: "SaaS Analytics & Operations Hub",
    category: "Dashboard",
    description: "Executive analytics dashboard featuring KPI metrics, segment filter chips, deployment tables, and modal actions.",
    code: `@theme material3

@Dashboard:screen
  row spacing=16 justify=between
    column spacing=4
      text "Operations & Infrastructure Analytics" display color=primary
      text "Real-time observability of transactions, microservices, and system health"
    row spacing=12
      button "Export Report" tonal icon=download
      button "New Deployment" filled icon=rocket goto=@DeployModal

  spacer height=12

  row spacing=12
    chip "Last 30 Days" variant=filter selected=true icon=calendar
    chip "Production (PRD)" variant=filter selected=true icon=server
    chip "North America" variant=filter
    chip "Error Alerts Only" variant=filter icon=alert-triangle

  spacer height=12

  grid cols=4 gap=16
    metric label="Monthly Revenue" value="$148,250" delta="+18.4% MoM" icon=dollar-sign
    metric label="Active Users (MAU)" value="24,890" delta="+3,120 new" icon=users
    metric label="Conversion Rate" value="4.82%" delta="+0.6% vs avg" icon=pie-chart
    metric label="System Uptime" value="99.98%" delta="Zero Incidents" icon=shield-check

  spacer height=16

  split
    left
      card elevated
        text "System Alerts & Logs" title
        listitem "High Database Load" subtitle="CPU usage at 84% on replica-02" icon=alert-circle badge="Urgent"
        listitem "SSL Certificate Renewed" subtitle="Valid through August 2027" icon=check-circle badge="Healthy"
        listitem "Automated Snapshot Finished" subtitle="420 GB backup stored to S3" icon=database
        spacer height=8
        button "View All Alerts" text icon=chevron-right

    right
      card elevated
        row spacing=16 justify=between
          text "Recent Microservice Deployments" title
          segmentedbutton env options=["All", "PRD", "QAS", "DEV"] selected="PRD"
        table columns=["Service", "Version", "Branch", "Status", "Actions"] striped=true searchable=true
          row ["auth-gateway-service", "v2.4.1", "main", "Active", "Configure"]
          row ["payment-processor-node", "v1.9.0", "release/1.9", "Active", "Configure"]
          row ["notification-dispatcher", "v3.0.0-rc", "feat/push", "Pending", "Configure"]
          row ["analytics-aggregator", "v2.1.2", "main", "Active", "Configure"]
          row ["audit-trail-logger", "v1.4.0", "hotfix/sync", "Inactive", "Configure"]

@DeployModal:dialog
  card elevated
    text "Confirm Production Deployment" headline color=primary
    text "You are about to deploy release artifact v2.4.0 to the PRODUCTION cluster."
    spacer height=12
    textfield releaseTag label="Release Tag" placeholder="v2.4.0-stable"
    textarea deployNotes label="Release Notes / Changelog" rows=3 placeholder="Optimized database indexing and updated dependency schemas..."
    switch runMigrations label="Execute automated database migrations" checked=true
    switch notifySlack label="Notify #ops-prod Slack engineering channel" checked=true
    spacer height=16
    row spacing=12 justify=end
      button "Cancel" text goto=back
      button "Confirm & Deploy" filled icon=rocket goto=@Dashboard
`,
  },
  {
    id: "ecommerce-checkout",
    title: "E-Commerce Checkout & Summary",
    category: "E-Commerce",
    description: "Streamlined multi-column checkout flow with delivery information, payment methods, order summary, and promo codes.",
    code: `@theme material3

@Checkout:screen
  row spacing=12
    button "Return to Store" text icon=arrow-left goto=@Store
  
  text "Complete Your Order" display color=primary
  text "Review your delivery address and payment details to process checkout."

  spacer height=16

  split
    left
      column spacing=16
        card elevated
          text "1. Shipping Address" title
          grid cols=2 gap=16
            textfield firstName label="First Name" placeholder="Alex"
            textfield lastName label="Last Name" placeholder="Morgan"
          autocomplete country label="Country / Region" placeholder="Search country..."
            option "United States"
            option "Canada"
            option "United Kingdom"
            option "Germany"
            option "Japan"
            option "Australia"
          textfield address label="Street Address" placeholder="742 Evergreen Terrace, Apt 4B" icon=map-pin
          grid cols=3 gap=12
            textfield city label="City" placeholder="San Francisco"
            textfield state label="State / Region" placeholder="CA"
            textfield zip label="Postal Code" placeholder="94107" type=number
          datepicker deliveryDate label="Preferred Delivery Date"
          textfield phone label="Phone Number" placeholder="+1 (555) 234-5678" icon=phone

        card elevated
          text "2. Delivery & Payment Method" title
          text "Shipping Method:" label
          row spacing=16
            radio shippingStd label="Standard (3-5 Days) - Free" group="shippingType" checked=true
            radio shippingExp label="Express 24h - $15.00 USD" group="shippingType"
          spacer height=8
          segmentedbutton paymentMethod options=["Credit Card", "PayPal", "Apple Pay", "Wire Transfer"] selected="Credit Card"
          spacer height=8
          textfield cardNumber label="Card Number" placeholder="4532 •••• •••• 8821" icon=credit-card
          grid cols=2 gap=16
            textfield exp label="Expiration (MM/YY)" placeholder="08/28"
            textfield cvv label="Security Code (CVV)" placeholder="821" type=password
          switch saveCard label="Securely save card for future purchases" checked=true

    right
      column spacing=16
        card elevated
          text "Order Summary (3 items)" title
          listitem "Pro Laptop Ultra 16\"" subtitle="32GB RAM / 1TB SSD • Qty: 1" badge="$1,899.00" icon=laptop
          listitem "Ergonomic 4K Monitor 27\"" subtitle="IPS / 144Hz • Qty: 1" badge="$450.00" icon=monitor
          listitem "Wireless Mechanical Keyboard" subtitle="Brown Tactile Switches • Qty: 1" badge="$120.00" icon=keyboard
          divider
          row spacing=12
            textfield promoCode label="Promo Code" placeholder="SUMMER2026"
            button "Apply" tonal
          divider
          row spacing=12 justify=between
            text "Subtotal"
            text "$2,469.00"
          row spacing=12 justify=between
            text "Special Discount (10%)" color=primary
            text "-$246.90" color=primary
          row spacing=12 justify=between
            text "Priority Express Shipping"
            text "Free" color=primary
          row spacing=12 justify=between
            text "Total Amount" headline
            text "$2,222.10" headline color=primary
          spacer height=12
          button "Pay $2,222.10" filled icon=shield-check goto=@OrderSuccess

@OrderSuccess:dialog
  card elevated
    text "Order Confirmed Successfully!" headline color=primary
    text "Your order #ORD-98421 has been placed and is being prepared for dispatch."
    alert "Receipt and carrier tracking number sent to your registered email." type=success title="Payment Authorized"
    spacer height=12
    button "View Order Details" filled goto=@Checkout
`,
  },
  {
    id: "clinic-patient-intake",
    title: "Clinical Patient Intake & Appointments",
    category: "Form",
    description: "Healthcare intake form with allergy validation, pain scale sliders, insurance verification, and scheduling.",
    code: `@theme material3

@PatientIntake:form
  text "Patient Intake & Consultation Scheduling" display color=primary
  text "Comprehensive clinical registration form. Complete all sections to ensure medical history accuracy."

  spacer height=16

  card elevated
    text "1. Patient Demographics" title
    grid cols=3 gap=16
      textfield fullName label="Full Legal Name" placeholder="Dr. Mariana Gomez" icon=user
      textfield ssn label="National ID / SSN" placeholder="XXX-XX-4912"
      textfield dob label="Date of Birth" placeholder="1985-04-12" icon=calendar
    grid cols=2 gap=16
      textfield email label="Email Address" placeholder="mariana.gomez@gmail.com" icon=mail
      textfield phone label="Mobile Phone" placeholder="+1 (555) 987-6543" icon=phone

  card elevated
    text "2. Clinical Background & Current Symptoms" title
    text "Select any active symptoms or underlying medical conditions:" label
    row spacing=8
      chip "Fever / Headache" variant=filter selected=true
      chip "Hypertension" variant=filter
      chip "Diabetes Type 2" variant=filter
      chip "Drug Allergies" variant=filter selected=true
      chip "Prior Surgeries" variant=filter
    spacer height=8
    textarea allergiesDetail label="Known Allergies & Current Prescriptions" rows=3 placeholder="Penicillin and sulfa allergy. Daily levothyroxine 50mcg..."
    grid cols=2 gap=16
      slider painScale label="Pain Intensity Scale (1 to 10)" min=1 max=10 value=3
      select specialty label="Requested Medical Specialty" options=["Internal Medicine", "Cardiology", "Dermatology", "Neurology", "Pediatrics"]

  card elevated
    text "3. Medical Insurance & Consent" title
    switch hasInsurance label="Covered by Major Medical Insurance" checked=true
    textfield insurer label="Insurance Provider & Policy Number" placeholder="BlueCross BlueShield - Policy #984210"
    checkbox consentTerms label="I have read and consent to the Clinical Privacy and Treatment Policies" checked=true
    spacer height=12
    row spacing=12 justify=end
      button "Reset Form" text
      button "Schedule Appointment" filled icon=calendar-check goto=@IntakeConfirm

@IntakeConfirm:dialog
  card elevated
    text "Appointment Scheduled Successfully" headline color=primary
    text "Your clinical consultation has been reserved with Dr. Carlos Mendez for August 24 at 10:30 AM."
    spacer height=12
    row spacing=12
      button "Download Calendar Reminder (PDF)" tonal icon=download
      button "Close" filled goto=@PatientIntake
`,
  },
  {
    id: "mobile-banking-transfer",
    title: "Mobile Banking & Express Transfers",
    category: "Mobile",
    description: "Mobile-first banking interface with quick contact chips, slider amount adjustments, and transfer confirmations.",
    code: `@theme material3

@MobileWallet:screen
  card elevated
    row spacing=12 justify=between
      row spacing=8
        avatar name="Alex M." size=md
        column spacing=2
          text "Hello, Alex" title
          text "Priority Account ••• 4190" label
      button "" tonal icon=bell

    spacer height=16
    text "Available Balance" label
    text "$48,920.50 USD" display color=primary
    row spacing=8
      chip "+$3,400 this month" icon=trending-up selected=true
      chip "12.5% APY High Yield" icon=shield

    spacer height=16
    row spacing=12
      button "Transfer" filled icon=send goto=@QuickTransfer
      button "Deposit" tonal icon=plus
      button "Pay Bills" outlined icon=zap
      button "Cardless ATM" text icon=smartphone

  spacer height=16
  card elevated
    row spacing=12 justify=between
      text "Recent Transactions" title
      button "View All" text
    listitem "Transfer to Carlos Mendez" subtitle="Today, 10:15 AM • Instant Wire" badge="-$1,250.00" icon=arrow-up-right
    listitem "Payroll Direct Deposit" subtitle="Yesterday, 08:00 AM • Acme Corp" badge="+$24,500.00" icon=arrow-down-left
    listitem "Cloud Services Subscription" subtitle="Aug 18 • Virtual Card" badge="-$45.00" icon=credit-card

@QuickTransfer:sheet
  card elevated
    row spacing=12 justify=between
      text "Instant Wire Transfer" headline color=primary
      button "" text icon=x goto=back
    
    text "Frequent Contacts:" label
    row spacing=12
      chip "Carlos M. (Chase)" icon=user selected=true
      chip "Ana Sofia (Wells Fargo)" icon=user
      chip "Rodrigo P. (Citi)" icon=user
      chip "+ Add New Contact" icon=plus

    spacer height=12
    textfield recipientAccount label="Recipient Account Number or Routing" placeholder="012 180 01548291024 8" icon=hash
    textfield beneficiary label="Beneficiary Full Name" placeholder="Carlos Mendez Lopez"
    textfield amount label="Transfer Amount ($ USD)" placeholder="1500.00" type=number icon=dollar-sign
    textfield memo label="Payment Memo / Reference" placeholder="Q3 Software Consulting Retainer"
    
    spacer height=12
    slider quickSlider label="Quick Amount Slider" min=100 max=10000 value=1500
    
    spacer height=16
    row spacing=12 justify=between
      button "Cancel" text goto=back
      button "Authorize Transfer" filled icon=shield-check goto=@TransferSuccess

@TransferSuccess:dialog
  card elevated
    text "Transfer Completed Successfully!" headline color=primary
    text "$1,500.00 USD sent to Carlos Mendez with wire tracking ID #TRX-9842104."
    alert "Funds are immediately available in the recipient account." type=success title="Instant Settlement"
    spacer height=12
    button "Return to Wallet" filled goto=@MobileWallet
`,
  },
  {
    id: "saas-billing-support",
    title: "SaaS Billing Portal & Support Hub",
    category: "Split View",
    description: "Enterprise billing portal with breadcrumbs, collapsible accordions, floating action button for tickets, and CSAT rating.",
    code: `@theme material3

@BillingHub:screen
  breadcrumbs items=["Customer Portal", "Acme Corporation", "Billing & Subscriptions"] separator=chevron
  
  snackbar "Invoice #INV-2024-08 issued and sent to billing@acme.com" action="View PDF" icon=check-circle-2 type=success goto=@InvoiceDetailModal
  
  row spacing=16 justify=between
    column spacing=4
      text "Billing & Enterprise Support Management" display color=primary
      text "Manage tax profiles, payment history, invoices, and technical support requests"
    row spacing=12
      button "Download All (ZIP)" tonal icon=download
      button "New Ticket" filled icon=help-circle goto=@NewTicketModal

  spacer height=8

  grid cols=3 gap=16
    metric label="Active Subscription" value="Enterprise 24/7" delta="Renews Sep 1" icon=shield
    metric label="Year-to-Date Spend" value="$14,280 USD" delta="+8.2% vs prev" icon=dollar-sign
    metric label="Support SLA Response" value="12 mins" delta="Optimal" icon=zap

  spacer height=12

  split
    left
      card elevated
        text "Account & Tax Configuration" title
        text "Expand each section to update your enterprise tax profile:" body
        
        accordion "1. Tax ID & Corporate Legal Entity" expanded=true icon=file-text badge="Required"
          textfield taxId label="Federal Tax ID / EIN" placeholder="12-3456789" icon=hash
          textfield legalName label="Legal Entity Name" placeholder="Acme International Inc."
          select taxRegime label="Tax Classification" options=["C Corporation", "S Corporation", "LLC Partnership", "Non-Profit 501(c)(3)"]
          button "Update Tax Profile" tonal icon=save

        accordion "2. Billing Contacts & Automated Notifications" expanded=false icon=mail
          textfield billingEmail label="Accounts Payable Email" placeholder="billing@acme.com" icon=mail
          textfield phone label="Direct Phone" placeholder="+1 (555) 123-4567" icon=phone
          switch autoEmail label="Automatically email PDF invoices upon billing" checked=true

        accordion "3. Enterprise SLA Terms & Addendums" expanded=false icon=shield-check
          text "Your Enterprise Master Services Agreement is active through December 31, 2026." caption
          alert "Your tier includes a dedicated Solutions Architect with guaranteed < 15-minute response SLA." type=info

    right
      card elevated
        text "Billing History & Past Invoices" title
        table columns=["Invoice ID", "Date", "Amount", "Status", "Action"] striped=true
          row ["#INV-2026-089", "2026-08-15", "$4,850.00", "Paid", "Download"]
          row ["#INV-2026-074", "2026-07-15", "$4,850.00", "Paid", "Download"]
          row ["#INV-2026-061", "2026-06-15", "$3,920.00", "Paid", "Download"]
          row ["#INV-2026-048", "2026-05-15", "$3,920.00", "Paid", "Download"]
        
        spacer height=12
        text "How would you rate your Technical Account Manager support?" label
        rating csatScore label="Customer Satisfaction (CSAT)" value=5 max=5

  fab "Create New Invoice" icon=plus extended=true goto=@InvoiceDetailModal

@InvoiceDetailModal:dialog
  card elevated
    text "Generate New Enterprise Invoice" headline color=primary
    breadcrumbs items=["Invoices", "New Issuance", "Draft #1042"]
    textfield customer label="Recipient / Account" placeholder="Acme Corporation" icon=user
    textfield amount label="Invoice Amount ($ USD)" placeholder="2450.00" type=number icon=dollar-sign
    select paymentTerms label="Payment Terms" options=["Net 30 Days", "Due on Receipt", "Net 60 Days"]
    textarea description label="Service Description" rows=2 placeholder="Wisp UI System architecture and cloud consultation retainer"
    row spacing=12 justify=between
      button "Cancel" text goto=close
      button "Issue & Send Invoice" filled icon=send goto=close

@NewTicketModal:modal
  card elevated
    text "Create Technical Support Ticket" headline color=primary
    textfield subject label="Ticket Subject" placeholder="Question regarding Webhook HMAC signatures"
    select priority label="Priority Level" options=["Low - General Inquiry", "Medium - Partial Degraded Performance", "Critical - Service Outage"]
    textarea details label="Detailed Description" rows=3
    row spacing=12 justify=between
      button "Close" text goto=close
      button "Submit Ticket" filled icon=send goto=close
`,
  },
  {
    id: "data-tables-and-tabs",
    title: "Data Hub: Dynamic Tables & Tabbed Views",
    category: "Dashboard",
    description: "Showcase of Wisp DSL tables with dynamic rows, column formatters, search filtering, pagination, and tabs.",
    code: `@theme material3

@DataHub:screen
  row spacing=16 justify=between
    column spacing=4
      text "Infrastructure Control & Data Operations" display color=primary
      text "Real-time searchable tables, automated status pills, and tabbed resource navigation"
    row spacing=12
      button "Refresh Data" tonal icon=refresh-cw
      button "Register Resource" filled icon=plus

  spacer height=12

  tabs items=["Microservices", "Users & Permissions", "Transaction Audit", "Preferences"]
    tab "Microservices"
      card elevated
        text "Cluster Service Health & Topology" title
        table title="Active Microservices Inventory" columns=["ID:code", "Service:text", "Health:progress", "Version:code", "Status:status", "Action:action", "Options:dropdown"] striped=true searchable=true pageSize=4
          row ["#SRV-101", "Auth Identity Gateway", "98%", "v2.5.0", "Active", "Configure", ""]
          row ["#SRV-102", "Payment Settlement Engine", "85%", "v1.8.4", "Active", "Configure", ""]
          row ["#SRV-103", "Notification Worker SQS", "35%", "v3.0.0-beta", "Pending", "Configure", ""]
          row ["#SRV-104", "Analytics Stream Sink", "100%", "v4.1.2", "Active", "Configure", ""]
          row ["#SRV-105", "Legacy Sync Bridge", "12%", "v0.9.1", "Inactive", "Configure", ""]
          row ["#SRV-106", "Search Indexer Service", "92%", "v2.2.0", "Active", "Configure", ""]

    tab "Users & Permissions"
      card elevated
        text "Organization Members & Access Control" title
        table title="Assigned Identity Accounts" columns=["Member:avatar", "Email:text", "Role:status", "Last Active:date", "Action:action", "Options:dropdown"] striped=true searchable=true
          row ["Alex Morgan", "alex@company.com", "Super Admin", "2026-08-20", "Edit", ""]
          row ["Elena Rodriguez", "elena@company.com", "DevOps Lead", "2026-08-19", "Edit", ""]
          row ["Carlos Mendoza", "carlos@company.com", "QA Engineer", "2026-08-15", "Edit", ""]
          row ["Sofia Castro", "sofia@company.com", "Security Lead", "2026-08-18", "Edit", ""]

    tab "Transaction Audit"
      card elevated
        text "Real-Time Transaction Audit Log" title
        table columns=["Tx ID:code", "Timestamp:date", "Amount:currency", "Method:text", "Result:status"] striped=true searchable=true
          | #TX-98412 | 2026-08-20 14:32 | $1,250.00 USD | Credit Card   | Active |
          | #TX-98413 | 2026-08-20 14:35 | $480.00 USD   | Wire Transfer | Active |
          | #TX-98414 | 2026-08-20 14:41 | $2,100.00 USD | PayPal API    | Pending |
          | #TX-98415 | 2026-08-20 14:45 | $95.00 USD    | Apple Pay     | Active |

    tab "Preferences"
      card elevated
        text "Dashboard Streaming Parameters" title
        row spacing=16
          switch autoRefresh label="Auto-refresh metrics every 30 seconds" checked=true
          switch notifyAlerts label="Play audio notification on critical error" checked=false
        spacer height=12
        button "Save Preferences" filled icon=save
`,
  },
  {
    id: "reusable-components-showcase",
    title: "Reusable Components • Modular Architecture",
    category: "Design System",
    description: "Modular component definition via @Component:component and reuse across multiple screens in Checkout and Profile views.",
    code: `@theme material3

# 1. Reusable Block Definitions
@CountrySelector:component
  autocomplete country label="Country of Residence" placeholder="Select country..."
    option "United States"
    option "Canada"
    option "United Kingdom"
    option "Germany"
    option "Japan"
    option "Australia"

@ShippingAddressBlock:component
  grid cols=2 gap=12
    textfield street label="Street Address" placeholder="100 Market St, Suite 400"
    textfield district label="District / Suite" placeholder="Financial District"
    textfield zip label="Postal / ZIP Code" placeholder="94105"
    component @CountrySelector

# 2. Main Checkout Screen Reusing the Modular Components
@Checkout:screen
  appbar "Modular Checkout & Billing" icon=shopping-bag
    button icon=user text goto=@BillingProfile

  breadcrumbs items=["Store", "Cart", "Checkout"] separator=chevron

  row spacing=16 justify=between
    column spacing=4
      text "Complete Your Purchase" display color=primary
      text "Enter your shipping details and preferred payment method."
    row spacing=12
      button "View Profile" tonal icon=user goto=@BillingProfile

  spacer height=12

  grid cols=3 gap=16
    column spacing=16
      card elevated
        text "1. Shipping Information" title
        grid cols=2 gap=12
          textfield firstName label="First Name" placeholder="Alex"
          textfield lastName label="Last Name" placeholder="Morgan"
        spacer height=8
        component @ShippingAddressBlock

    column spacing=16
      card elevated
        text "2. Payment Method" title
        radio method1 label="Credit / Debit Card" checked=true
        grid cols=2 gap=12
          textfield cardNum label="Card Number" placeholder="•••• •••• •••• 4242"
          textfield exp label="Expiration" placeholder="12/28"
        spacer height=8
        radio method2 label="Instant Bank Wire"
        radio method3 label="PayPal Express"

    column spacing=16
      card filled
        text "Order Summary" title
        row spacing=8 justify=between
          text "Subtotal (3 items)" body
          text "$1,450.00 USD" font-mono
        row spacing=8 justify=between
          text "Shipping Fee" body
          text "Free" font-mono color=success
        divider
        row spacing=8 justify=between
          text "Total Due" title
          text "$1,450.00 USD" headline color=primary
        spacer height=12
        button "Authorize & Pay" filled icon=check-circle goto=@PaymentSuccessToast snackbar-type=success

# 3. Profile Screen Reusing the Same Component
@BillingProfile:screen
  appbar "My Account • Tax & Billing Details" icon=user
    button icon=arrow-left text goto=@Checkout

  card elevated
    text "Default Billing Address" title
    text "This address will be automatically populated during future checkout sessions." body
    spacer height=12
    component @ShippingAddressBlock
    spacer height=16
    row spacing=12 justify=end
      button "Return to Checkout" outlined goto=@Checkout
      button "Save Changes" filled icon=save goto=@Checkout

@PaymentSuccessToast:snackbar "Payment processed successfully! Confirmation sent to your email." snackbar-duration=4000 snackbar-action="View Order"
`,
  },
  {
    id: "design-system-components",
    title: "Component Library • Design System Patterns",
    category: "Design System",
    description: "Advanced UI architecture with reusable components for global headers, KPI metric cards, filter bars, and tables.",
    code: `@theme material3

# ===================================================
# 1. REUSABLE BLOCKS & COMPONENTS (DESIGN SYSTEM)
# ===================================================

@GlobalHeader:component
  row spacing=12 justify=between align=center
    row spacing=8 align=center
      icon name=cpu size=28 color=primary
      column spacing=2
        text "Kiro Enterprise Platform" title
        text "Multi-Cloud Observability & Cluster Management" caption
    row spacing=8
      chip "v2.6.4" assist
      badge "Production" variant=success
      button "Configure" outlined icon=settings

@KpiMetricCard:component
  card elevated
    row spacing=12 justify=between align=center
      column spacing=4
        text "Transactions / Sec" caption
        text "4,829 ops" headline color=primary
      icon name=activity size=28 color=primary
    divider
    row spacing=8 justify=between align=center
      badge "+14.2% vs yesterday" variant=success
      text "99.98% uptime" caption

@GlobalFilters:component
  row spacing=12 align=center
    searchbar query placeholder="Search services, nodes, or IP addresses..."
    select timeRange label="Date Range"
      option "Last 24 Hours"
      option "Last 7 Days"
      option "Current Month"
    button "Export Report" tonal icon=download

# ===================================================
# 2. MAIN SCREEN CONSUMING THE COMPONENTS
# ===================================================

@MonitoringDashboard:screen
  component @GlobalHeader
  spacer height=12

  component @GlobalFilters
  spacer height=16

  grid cols=3 gap=16
    component @KpiMetricCard
    card elevated
      row spacing=12 justify=between align=center
        column spacing=4
          text "P99 Average Latency" caption
          text "18.4 ms" headline color=primary
        icon name=clock size=28 color=primary
      divider
      row spacing=8 justify=between align=center
        badge "-3.1 ms" variant=success
        text "Below threshold (50ms)" caption

    card elevated
      row spacing=12 justify=between align=center
        column spacing=4
          text "Healthy Nodes" caption
          text "48 / 48" headline color=primary
        icon name=server size=28 color=primary
      divider
      row spacing=8 justify=between align=center
        badge "100% Healthy" variant=success
        text "Region us-central1" caption

  spacer height=16

  card elevated
    row spacing=12 justify=between align=center
      text "Active Microservices in Cluster" title
      button "New Deployment" filled icon=plus
    
    table title="Microservices" columns=["ID:code", "Service:text", "Health:status", "CPU:progress", "Actions:action"] striped searchable
      row ["#SVC-01", "Auth Gateway API", "Active", "35%", "View Logs"]
      row ["#SVC-02", "Payment Processor", "Active", "58%", "View Logs"]
      row ["#SVC-03", "Notification Engine", "Active", "22%", "View Logs"]
      row ["#SVC-04", "Analytics Pipeline", "Active", "84%", "View Logs"]
`,
  },
  {
    id: "app-rail-and-sheets",
    title: "Navigation Rail, App Rail & Side Sheet",
    category: "Design System",
    description: "Vertical navigation rail, collapsible side sheets, contextual drawers, and progress indicators.",
    code: `@theme material3

@RailStudio:screen
  split
    left
      navigationrail title="Studio" fab=plus
        navitem "Dashboard" icon=home active
        navitem "Analytics" icon=bar-chart-2 badge="8"
        navitem "Inbox" icon=inbox badge="5"
        navitem "Inventory" icon=package
        navitem "Settings" icon=settings

    right
      column spacing=16
        appbar "Navigation Rail & App Rail Showcase" icon=layout
          button icon=bell text badge="3"
          button icon=share-2 text

        row spacing=16 justify=between
          column spacing=4
            text "Material 3 Vertical Navigation & Auxiliary Surfaces" display color=primary
            text "Designed for medium and expanded screens (tablets, foldables, desktops) following official M3 guidelines."
          row spacing=12
            button "Open Side Sheet" filled icon=sidebar goto=@SideSheetModal
            button "Open Drawer" tonal icon=menu goto=@DrawerModal

        grid cols=3 gap=16
          metric label="Active Rail Items" value="5 Dest" delta="3 with Badges" icon=compass
          metric label="FAB Action" value="Primary" delta="Extended / Standard" icon=plus
          metric label="Screen Scale" value="Adaptive" delta="M3 Expressive" icon=maximize-2

        card elevated
          text "Progress & Loading States" title
          loading "Synchronizing design tokens with cloud backend..."
          spacer height=8
          linearprogress value=68 message="Compiling assets (68%)"
          spacer height=8
          row spacing=16
            circularprogress value=84 message="RAM Usage"
            circularprogress value=96 message="Efficiency"

        card elevated
          text "Interactive Card Carousel" title
          carousel
            card outlined
              text "Emerald Executive Suite" title
              text "Dedicated workspace with high-speed fiber connection and ergonomic station." body
            card outlined
              text "Panoramic Sky Lounge" title
              text "Scenic meeting area with natural daylight and collaboration boards." body
            card outlined
              text "Innovation Lab" title
              text "Equipped with multi-device hardware testing rigs." body

@SideSheetModal:sidesheet
  sidesheet title="Auxiliary Filtering & Details"
    text "Side sheets provide quick contextual editing without leaving the main dashboard." body
    spacer height=12
    select filterCategory label="Category Filter" options=["All Categories", "Observability", "Security", "Billing"]
    slider budgetLimit label="Memory Threshold (MB)" min=256 max=8192 value=2048
    switch alertOnExceed label="Trigger webhook when exceeded" checked=true
    spacer height=16
    row spacing=12 justify=end
      button "Cancel" text goto=close
      button "Apply" filled goto=close

@DrawerModal:drawer
  drawer title="Management Console" subtitle="admin@company.com"
    draweritem "Main Overview" icon=home active
    draweritem "Microservices" icon=server badge="12"
    draweritem "API Gateways" icon=globe
    section "Administration"
    draweritem "Security & Audit" icon=shield-check
    draweritem "Settings" icon=settings
    draweritem "Close Panel" icon=x goto=close
`,
  },
];
