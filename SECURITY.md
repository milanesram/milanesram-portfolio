# Security Policy

## Supported Version

The current production release is supported. Historical and development branches should not automatically be treated as supported production releases.

The production-validated Version 1.0 release is tagged `v1.0.0`.

## Reporting a Vulnerability

Do not disclose suspected vulnerabilities in public GitHub issues, discussions, pull requests, or social media.

After GitHub publication, GitHub Private Vulnerability Reporting is the preferred mechanism if it is enabled on the repository.

If that mechanism is unavailable, contact the maintainer privately at:

`milanesram@gmail.com`

Please include:

- a concise description of the issue
- the affected route, component, or behavior
- reproduction steps
- possible impact
- relevant screenshots or request/response details
- a suggested remediation if known

Do not send credentials, tokens, personal data, or other sensitive information unless specifically requested through a private channel.

## Disclosure

Please allow a reasonable period for investigation and remediation before any public disclosure.

## Security Architecture

Application-level security design is documented in [docs/SECURITY.md](docs/SECURITY.md).

Environment-variable names may be documented in this repository. Production secret values are not stored here.
