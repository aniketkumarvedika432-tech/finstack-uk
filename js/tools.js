(function () {
    "use strict";

    /*
     * FinStack UK
     * Tool directory data
     *
     * This file intentionally contains structured data so that
     * the directory can be expanded easily by a future owner.
     */

    window.FinStackTools = [
        {
            id: "xero",
            name: "Xero",
            category: "Accounting",
            slug: "xero",
            description:
                "Cloud accounting software with invoicing, bank reconciliation, VAT and Making Tax Digital support.",
            bestFor:
                "Growing limited companies and established SMEs",
            price:
                "Paid plans available",
            tags: [
                "Accounting",
                "VAT",
                "MTD",
                "Invoicing",
                "Bank reconciliation"
            ],
            website:
                "https://www.xero.com/uk/"
        },

        {
            id: "freeagent",
            name: "FreeAgent",
            category: "Accounting",
            slug: "freeagent",
            description:
                "UK-focused accounting software designed for freelancers, contractors and small businesses.",
            bestFor:
                "Sole traders, freelancers and contractors",
            price:
                "Paid plans; free options may be available through qualifying banking arrangements",
            tags: [
                "Accounting",
                "Self Assessment",
                "MTD",
                "Invoicing"
            ],
            website:
                "https://www.freeagent.com/"
        },

        {
            id: "pandle",
            name: "Pandle",
            category: "Accounting",
            slug: "pandle",
            description:
                "Simple online bookkeeping software designed for small businesses and sole traders.",
            bestFor:
                "Micro businesses and startups",
            price:
                "Free and paid options",
            tags: [
                "Bookkeeping",
                "Accounting",
                "Invoicing",
                "Small business"
            ],
            website:
                "https://www.pandle.com/"
        },

        {
            id: "tide",
            name: "Tide",
            category: "Payments",
            slug: "tide",
            description:
                "UK business banking platform offering business accounts, invoicing and expense management features.",
            bestFor:
                "New and small UK businesses",
            price:
                "Free and paid account options",
            tags: [
                "Business banking",
                "Payments",
                "Invoicing",
                "Expenses"
            ],
            website:
                "https://www.tide.co/"
        },

        {
            id: "anna-money",
            name: "ANNA Money",
            category: "Payments",
            slug: "anna-money",
            description:
                "Digital business account combining banking, invoicing, receipt management and business administration tools.",
            bestFor:
                "Sole traders and small businesses wanting automation",
            price:
                "Paid plans; trial options may be available",
            tags: [
                "Business banking",
                "Invoicing",
                "Receipts",
                "Automation"
            ],
            website:
                "https://anna.money/"
        },

        {
            id: "wise-business",
            name: "Wise Business",
            category: "Payments",
            slug: "wise-business",
            description:
                "Multi-currency business account and international payment solution for companies trading across borders.",
            bestFor:
                "Businesses receiving or sending international payments",
            price:
                "Pay-per-use pricing",
            tags: [
                "Multi-currency",
                "International payments",
                "FX",
                "Transfers"
            ],
            website:
                "https://wise.com/gb/business/"
        },

        {
            id: "iwoca",
            name: "iwoca",
            category: "Lending",
            slug: "iwoca",
            description:
                "Flexible business finance and credit solutions designed for UK small businesses.",
            bestFor:
                "Businesses needing flexible short-term finance",
            price:
                "Custom pricing",
            tags: [
                "Business finance",
                "Credit",
                "Working capital",
                "SME lending"
            ],
            website:
                "https://www.iwoca.co.uk/"
        },

        {
            id: "funding-circle",
            name: "Funding Circle",
            category: "Lending",
            slug: "funding-circle",
            description:
                "Business finance platform focused on providing funding solutions to established SMEs.",
            bestFor:
                "Established businesses seeking larger funding",
            price:
                "Custom pricing",
            tags: [
                "Business loans",
                "SME finance",
                "Working capital"
            ],
            website:
                "https://www.fundingcircle.com/uk/"
        },

        {
            id: "sage",
            name: "Sage Accounting",
            category: "Compliance",
            slug: "sage-accounting",
            description:
                "Established accounting platform supporting VAT, bookkeeping and Making Tax Digital workflows.",
            bestFor:
                "Established SMEs needing broader accounting functionality",
            price:
                "Paid plans available",
            tags: [
                "Accounting",
                "VAT",
                "MTD",
                "Compliance"
            ],
            website:
                "https://www.sage.com/en-gb/"
        },

        {
            id: "coconut",
            name: "Coconut",
            category: "Compliance",
            slug: "coconut",
            description:
                "Accounting and tax management software aimed at freelancers and sole traders.",
            bestFor:
                "Freelancers managing their own tax",
            price:
                "Paid plans; trial options may be available",
            tags: [
                "Tax",
                "Self Assessment",
                "Accounting",
                "Freelancers"
            ],
            website:
                "https://www.getcoconut.com/"
        }
    ];


    /*
     * Utility functions
     */

    window.FinStackTools.getById = function (id) {
        return this.find(function (tool) {
            return tool.id === id;
        });
    };

    window.FinStackTools.getByCategory = function (category) {
        return this.filter(function (tool) {
            return (
                tool.category.toLowerCase() ===
                category.toLowerCase()
            );
        });
    };

    window.FinStackTools.search = function (query) {
        query = (query || "").toLowerCase().trim();

        if (!query) {
            return this;
        }

        return this.filter(function (tool) {
            var searchableText = [
                tool.name,
                tool.category,
                tool.description,
                tool.bestFor,
                tool.price,
                tool.tags.join(" ")
            ]
                .join(" ")
                .toLowerCase();

            return searchableText.indexOf(query) !== -1;
        });
    };


    /*
     * Provider profile helper
     *
     * If tool.html is opened with:
     *
     * tool.html?id=xero
     *
     * this function can retrieve the corresponding provider.
     */

    window.FinStackTools.getFromURL = function () {
        var params = new URLSearchParams(window.location.search);
        var id = params.get("id");

        if (!id) {
            return null;
        }

        return this.getById(id);
    };


    /*
     * Simple outbound click tracking hook.
     *
     * This does NOT send data anywhere by itself.
     * A future owner can connect analytics here.
     */

    window.FinStackTools.trackOutboundClick = function (tool) {
        if (!tool) {
            return;
        }

        /*
         * Future analytics integration can be added here.
         *
         * Example:
         * gtag("event", "provider_click", {
         *     provider: tool.name,
         *     category: tool.category
         * });
         */
    };


    /*
     * Optional automatic provider-page population.
     *
     * Works when tool.html contains elements with these IDs:
     *
     * tool-name
     * tool-category
     * tool-description
     * tool-best-for
     * tool-price
     * tool-website
     * tool-tags
     */

    document.addEventListener("DOMContentLoaded", function () {
        var tool = window.FinStackTools.getFromURL();

        if (!tool) {
            return;
        }

        var name = document.getElementById("tool-name");
        var category = document.getElementById("tool-category");
        var description =
            document.getElementById("tool-description");
        var bestFor =
            document.getElementById("tool-best-for");
        var price =
            document.getElementById("tool-price");
        var website =
            document.getElementById("tool-website");
        var tags =
            document.getElementById("tool-tags");

        if (name) {
            name.textContent = tool.name;
        }

        if (category) {
            category.textContent = tool.category;
        }

        if (description) {
            description.textContent = tool.description;
        }

        if (bestFor) {
            bestFor.textContent = tool.bestFor;
        }

        if (price) {
            price.textContent = tool.price;
        }

        if (website) {
            website.href = tool.website;
            website.target = "_blank";
            website.rel = "noopener noreferrer";

            website.addEventListener("click", function () {
                window.FinStackTools.trackOutboundClick(tool);
            });
        }

        if (tags) {
            tags.innerHTML = "";

            tool.tags.forEach(function (tag) {
                var span = document.createElement("span");

                span.className = "badge-pill";
                span.textContent = tag;

                tags.appendChild(span);
            });
        }
    });

})();
