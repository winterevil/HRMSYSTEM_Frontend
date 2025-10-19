import React from 'react';

export default function Footer() {
    return (
        <div className="section-body">
            <footer className="footer">
                <div className="container-fluid">
                    <div className="row">
                        <div className="col-md-6 col-sm-12">
                            Copyright © 2025 <a className="font700 ml-1" href="https://themeforest.net/user/puffintheme/portfolio">MyHRM</a>.
                        </div>
                        <div className="col-md-6 col-sm-12 text-md-right">
                            <ul className="list-inline mb-0">
                                <li className="list-inline-item"><a href="#">Documentation</a></li>
                                <li className="list-inline-item"><a href="javascript:void(0)">FAQ</a></li>
                                <li className="list-inline-item"><a href="javascript:void(0)" className="btn btn-outline-primary btn-sm">Buy Now</a></li>
                            </ul>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}