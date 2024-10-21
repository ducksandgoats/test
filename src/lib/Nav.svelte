<script>
    import {Row, Col, Navbar, Nav, NavItem, NavLink} from '@sveltestrap/sveltestrap'
    import {link} from 'svelte-spa-router'
</script>

<Row>
    <Col>
        <Navbar color="light" light expand="md" container="md">
            <Nav navbar>
                <NavItem>
                    <NavLink href="#/">Home</NavLink>
                    <!-- <a href="/" use:link>Home</a> -->
                </NavItem>
                <NavItem>
                    <NavLink href="#/dexie">Dexie</NavLink>
                    <!-- <a href="/dexie" use:link>Dexie</a> -->
                </NavItem>
                <NavItem>
                    <NavLink href="#/gun">Gun</NavLink>
                    <!-- <a href="/gun" use:link>Gun</a> -->
                </NavItem>
            </Nav>
            <Nav class="ms-auto" navbar>
                <NavItem>
                    <NavLink href="#/msg">Msg</NavLink>
                    <!-- <a href="/msg" use:link>Msg</a> -->
                </NavItem>
                <NavItem>
                    <NavLink href="#/pubsub">Pubsub</NavLink>
                    <!-- <a href="/pubsub" use:link>Pubsub</a> -->
                </NavItem>
                <NavItem>
                    <NavLink href="#/topic">Topic</NavLink>
                    <!-- <a href="/topic" use:link>Topic</a> -->
                </NavItem>
            </Nav>
        </Navbar>
    </Col>
</Row>