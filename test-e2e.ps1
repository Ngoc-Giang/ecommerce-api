param(
  [Parameter(Mandatory = $true)][string]$AdminPassword,
  [string]$Base = "http://localhost:3000"
)

function Call($Method, $Path, $Body = $null, $Headers = @{}) {
  $p = @{ Method = $Method; Uri = "$Base$Path"; Headers = $Headers; UseBasicParsing = $true; ContentType = "application/json" }
  if ($Body) { $p.Body = ($Body | ConvertTo-Json -Depth 5) }
  try { $r = Invoke-WebRequest @p; $code = [int]$r.StatusCode; $content = $r.Content }
  catch { $code = [int]$_.Exception.Response.StatusCode; $content = $_.ErrorDetails.Message }
  $data = $null
  if ($content) { try { $data = $content | ConvertFrom-Json } catch {} }
  [pscustomobject]@{ Code = $code; Data = $data }
}

function Check($Name, $Actual, $Expected) {
  if ($Actual -eq $Expected) { Write-Host "PASS  $Name" -ForegroundColor Green }
  else { Write-Host "FAIL  $Name (got $Actual, expected $Expected)" -ForegroundColor Red }
}

$s = Get-Random -Maximum 99999
$cust = "cust$s"; $other = "other$s"

$r = Call GET "/health"; Check "health 200" $r.Code 200
$r = Call POST "/api/auth/login" @{ username = "admin"; password = $AdminPassword }; Check "admin login" $r.Code 200
$adminH = @{ Authorization = "Bearer $($r.Data.data.token)" }

$r = Call POST "/api/auth/register" @{ username = $cust; password = "123456"; fullname = "Customer" }; Check "register customer" $r.Code 201
$r = Call POST "/api/auth/login" @{ username = $cust; password = "123456" }; Check "customer login" $r.Code 200
$custH = @{ Authorization = "Bearer $($r.Data.data.token)" }
$r = Call POST "/api/auth/login" @{ username = $cust; password = "wrong" }; Check "wrong password -> 401" $r.Code 401

$r = Call GET "/api/products"; Check "products without token -> 401" $r.Code 401
$prod = @{ pname = "Phone $s"; price = 500; quantity = 5 }
$r = Call POST "/api/products" $prod $custH; Check "customer create product -> 403" $r.Code 403
$r = Call POST "/api/products" $prod $adminH; Check "admin create product -> 201" $r.Code 201
$productId = $r.Data.data.pid

$r = Call POST "/api/orders" @{ items = @(@{ pid = $productId; quantity = 9 }) } $custH; Check "order over stock -> 400" $r.Code 400
$r = Call POST "/api/orders" @{ items = @(@{ pid = $productId; quantity = 2 }, @{ pid = $productId; quantity = 1 }) } $custH; Check "order duplicate pid -> 201" $r.Code 201
$oid = $r.Data.data.oid
$r = Call GET "/api/products/$productId" $null $custH; Check "stock is 2 after order" $r.Data.data.quantity 2

$r = Call GET "/api/orders/$oid" $null $custH; Check "owner views order -> 200" $r.Code 200
$r = Call POST "/api/auth/register" @{ username = $other; password = "123456"; fullname = "Other" }
$r = Call POST "/api/auth/login" @{ username = $other; password = "123456" }
$otherH = @{ Authorization = "Bearer $($r.Data.data.token)" }
$r = Call GET "/api/orders/$oid" $null $otherH; Check "other user views order -> 403" $r.Code 403
$r = Call GET "/api/orders/$oid" $null $adminH; Check "admin views order -> 200" $r.Code 200

$r = Call POST "/api/orders/$oid/shipment" $null $custH; Check "customer create shipment -> 403" $r.Code 403
$r = Call POST "/api/orders/$oid/shipment" $null $adminH; Check "admin create shipment -> 201" $r.Code 201
$r = Call PATCH "/api/orders/$oid/shipment" @{ status = "Shipped" } $adminH; Check "update shipment -> 200" $r.Code 200
$r = Call PATCH "/api/orders/$oid/shipment" @{ status = "Bad" } $adminH; Check "invalid status -> 400" $r.Code 400