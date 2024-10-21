<script>
    import {Row, Col, Navbar, Nav, NavItem} from '@sveltestrap/sveltestrap'
    import {link} from 'svelte-spa-router'
</script>

<Row>
    <Col>
        <Navbar color="light" light expand="md" container="md">
            <Nav navbar>
                <NavItem>
                    <a href="/" use:link>Home</a>
                </NavItem>
                <NavItem>
                    <a href="/dexie" use:link>Dexie</a>
                </NavItem>
                <NavItem>
                    <a href="/gun" use:link>Gun</a>
                </NavItem>
            </Nav>
            <Nav class="ms-auto" navbar>
                <NavItem>
                    <a href="/" use:link>Home</a>
                </NavItem>
                <NavItem>
                    <a href="/dexie" use:link>Dexie</a>
                </NavItem>
                <NavItem>
                    <a href="/gun" use:link>Gun</a>
                </NavItem>
                </Nav>
          </Navbar>
    </Col>
</Row>