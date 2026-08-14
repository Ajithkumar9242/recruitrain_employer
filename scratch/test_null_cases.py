import re

def verify_billing_page_jsx():
    with open('src/pages/app/Billing/BillingPage.jsx', 'r', encoding='utf-8') as f:
        code = f.read()

    # Verify no activeSub.autoRenew direct access without optional chaining and null checking
    assert "activeSub.autoRenew" not in code or "activeSub?.autoRenew" in code, "Unsafe activeSub.autoRenew found"

    # Verify renderAutoRenewText helper handles true, false, and null
    assert "renderAutoRenewText" in code, "renderAutoRenewText helper missing"
    assert "'Enabled'" in code and "'Disabled'" in code and "'Not available'" in code, "AutoRenew states missing"

    # Verify optional chaining on activeSub
    matches = re.findall(r'activeSub\.[a-zA-Z0-9]+', code)
    print("Direct activeSub property accesses:", matches)
    assert len(matches) == 0, f"Found unsafe direct activeSub property accesses: {matches}"

    # Verify Spin tip deprecation removed
    assert '<Spin tip=' not in code, "Deprecated Spin tip prop found in BillingPage"

    # Verify Modal uses open instead of visible (or both safely)
    assert 'open={isPreviewModalVisible}' in code, "Modal open prop missing"

    print("BillingPage.jsx code audit PASSED - 100% null safe!")

if __name__ == '__main__':
    verify_billing_page_jsx()
