import React from 'react';

export default function ThemeSwitcher() {
    return (
        <div className="theme_div">
            <div className="border-bottom p-2 p-3">
                <a href="javascript:void(0)" className="themebar float-right">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="icon icon-tabler icons-tabler-outline icon-tabler-x"><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M18 6l-12 12" /><path d="M6 6l12 12" /></svg>
                </a>
                <h6 className="mb-0">Choose Theme</h6>
            </div>
            <div className="card">
                <div className="card-body">
                    <ul className="list-group list-unstyled">
                        <li className="list-group-item mb-2">
                            <p>Default Theme <span className="badge badge-success font-13 font-weight-normal ml-1">New</span></p>
                            <a href="#"><img src="/assets/images/themes/default.png" className="img-fluid" /></a>
                        </li>
                        <li className="list-group-item mb-2">
                            <p>Night Mode Theme</p>
                            <a href="https://puffintheme.com/template/epic-pro/dark/index.html"><img src="/assets/images/themes/dark.png" className="img-fluid" /></a>
                        </li>
                        <li className="list-group-item mb-2">
                            <p>RTL Version</p>
                            <a href="https://puffintheme.com/template/epic-pro/rtl/index.html"><img src="/assets/images/themes/rtl.png" className="img-fluid" /></a>
                        </li>
                        <li className="list-group-item mb-2">
                            <p>Theme Version1</p>
                            <a href="https://puffintheme.com/template/epic-pro/main/index.html"><img src="/assets/images/themes/theme1.png" className="img-fluid" /></a>
                        </li>
                        <li className="list-group-item mb-2">
                            <p>Theme Version2</p>
                            <a href="https://puffintheme.com/template/epic-pro/theme2/index.html"><img src="/assets/images/themes/theme2.png" className="img-fluid" /></a>
                        </li>
                        <li className="list-group-item mb-2">
                            <p>Theme Version3</p>
                            <a href="https://puffintheme.com/template/epic-pro/theme3/index.html"><img src="/assets/images/themes/theme3.png" className="img-fluid" /></a>
                        </li>
                        <li className="list-group-item mb-2">
                            <p>Theme Version4</p>
                            <a href="https://puffintheme.com/template/epic-pro/theme4/index.html"><img src="/assets/images/themes/theme4.png" className="img-fluid" /></a>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    );
}